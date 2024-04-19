import { Request, Response } from "express";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";
import { encrypt } from "../lib/encrypt..js";

import { getRestaurantById } from "../data/restaurant.js";

import {
  getTableById,
  getTableByLabelAndRestaurantId,
  getTablesByRestaurantId,
} from "../data/table.js";

import {
  UUIDSchema,
  CreateTableReqSchema,
  DeleteTableParamSchema,
  TableSchema,
  CoordsSchema,
} from "../schemas/schemas.js";

import { Coords } from "../schemas/types.js";

/* *********************** Add Table Controller *********************** */
export const createTable = async (req: Request, res: Response) => {
  // Validate parameter
  const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

  if (!validatedParameter.success) {
    return sendResponse(res, 400, "invalid parameter values");
  }

  const restaurantId = validatedParameter.data;

  // Validate request body
  const validatedRequest = CreateTableReqSchema.safeParse(req.body);

  if (!validatedRequest.success) {
    return sendResponse(res, 400, "invalid input or missing fields");
  }

  const { label, capacity } = validatedRequest.data;

  const existingRestaurant = await getRestaurantById(restaurantId);

  if (!existingRestaurant) {
    return sendResponse(res, 404, "no restaurant found");
  }

  // Check if user has permission
  if (existingRestaurant.business_id !== req.user.id) {
    return sendResponse(res, 403, "invalid session");
  }

  // Check if the label is not duplicate
  const existingLabel = await getTableByLabelAndRestaurantId(
    label,
    restaurantId
  );

  if (existingLabel) {
    return sendResponse(res, 409, "label is already registered");
  }

  // Start client
  const client = await pool.connect();

  try {
    client.query("BEGIN");

    // Insert data if its not duplicate label, return table ID
    const insertQuery = `
      INSERT INTO restaurant_table 
        (restaurant_id, label, capacity) 
      VALUES
        ($1, $2, $3)
      RETURNING
        id
    `;

    const insertQueryResult = await client.query(insertQuery, [
      restaurantId,
      label,
      capacity,
    ] as any);

    if (insertQueryResult.rowCount == 0) {
      await client.query("ROLLBACK");
      return sendResponse(res, 500, "internal server error");
    }

    const tableId: string = insertQueryResult.rows[0].id;

    // Get restaurants' coordinates
    const coordsQuery = `
        SELECT latitude, longitude
        FROM restaurant_address
        WHERE restaurant_id = $1
      `;

    const coordsQueryResult = await client.query(coordsQuery, [
      existingRestaurant.id,
    ]);

    if (coordsQueryResult.rowCount == 0) {
      await client.query("ROLLBACK");
      return sendResponse(res, 500, "internal server error");
    }

    const coords: Coords = CoordsSchema.parse(coordsQueryResult.rows[0]);

    // encrypt data
    const dataToEncrypt = {
      tableId,
      ...coords,
    };

    const encryptedData = encrypt(dataToEncrypt);

    const byteLength = Buffer.byteLength(encryptedData, "utf8");

    const insertEncryptedDataQuery = `
      UPDATE restaurant_table
      SET table_hash = $1
      WHERE id = $2
    `;

    await client.query(insertEncryptedDataQuery, [encryptedData, tableId]);

    await client.query("COMMIT");

    return sendResponse(res, 200, "table registered succesfully");
  } catch (error) {
    client.query("ROLLBACK");
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  } finally {
    client.release();
  }
};

/* *********************** Delete Table Controller *********************** */
export const deleteTable = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameters = DeleteTableParamSchema.safeParse(req.params);

    if (!validatedParameters.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const { restaurantId, tableId } = validatedParameters.data;

    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    const existingTable = await getTableById(tableId);

    if (
      !existingTable ||
      existingTable.restaurantId !== existingRestaurant.id
    ) {
      return sendResponse(res, 404, "no table found");
    }

    const query = `
    DELETE FROM restaurant_table
      WHERE id = $1
    `;

    await pool.query(query, [tableId]);

    return sendResponse(res, 200, "table deleted succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Get Table Controller *********************** */
export const getTables = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    const data = await getTablesByRestaurantId(restaurantId);

    if (!data) {
      return sendResponse(
        res,
        200,
        "restaurant tables fetched succesfully",
        []
      );
    }

    const validatedData = TableSchema.array().parse(data);

    return sendResponse(
      res,
      200,
      "restaurant tables fetched succesfully",
      validatedData
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
