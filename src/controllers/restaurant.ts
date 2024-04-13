import { Request, Response } from "express";

import sendResponse from "../lib/api-response.js";
import { updateProfile } from "../lib/update-restaurant-profile-new.js";
import { deleteFile } from "../lib/delete-file.js";

import {
  getRestaurantById,
  getRestaurantAddressById,
  getRestaurantsByBusinessId,
  getRestaurantMenuByRestaurantId,
} from "../data/restaurant.js";

import {
  ProfileResponseSchema,
  RestaurantSchema,
  UUIDSchema,
  EditProfileTextReqSchema,
} from "../schemas/schemas.js";

/* *********************** Get Profile Controller *********************** */
export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const businessId = req.user.id;

    // Fetch all restaurants associated with the business ID
    const restaurants = await getRestaurantsByBusinessId(businessId);

    // Check for restaurant
    if (!restaurants) {
      return sendResponse(res, 404, "no restaurants found");
    }

    const data = [];

    // Loop through every restaurant
    for (const restaurant of restaurants) {
      const restaurantData = await getRestaurantById(restaurant.id);
      const restaurantAddress = await getRestaurantAddressById(restaurant.id);

      if (!restaurantData || !restaurantAddress) {
        return sendResponse(res, 500, "internal server error");
      }

      const { business_id, ...restaurantDataWithoutBusinessId } =
        restaurantData;

      const restaurantWithAddress = {
        restaurant: {
          ...restaurantDataWithoutBusinessId,
          address: restaurantAddress,
        },
      };

      data.push(restaurantWithAddress);
    }

    const parsedData = ProfileResponseSchema.parse(data);

    sendResponse(res, 200, "restaurants fetched succesfully", parsedData);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Get Menu Controller *********************** */
export const getMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const menu = await getRestaurantMenuByRestaurantId(id);

    sendResponse(res, 200, "restaurants fetched succesfully", menu);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
/* *********************** Edit Restaurant Text Controller *********************** */
export const editProfile = async (req: Request, res: Response) => {
  try {
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }

    const restaurantId = validatedParameter.data;

    const parsedReqBody = EditProfileTextReqSchema.safeParse(req.body);

    if (!parsedReqBody.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    // If no data is passed
    if (Object.keys(parsedReqBody.data).length === 0) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    // Fetch current restaurant data.
    const currentRestaurantData = await getRestaurantById(restaurantId);

    if (!currentRestaurantData) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Attach new data to the object

    const newRestaurantData = {
      ...currentRestaurantData,
      ...parsedReqBody.data,
    };

    // Updata database

    const validatedData = RestaurantSchema.parse(newRestaurantData);

    await updateProfile(validatedData);

    return sendResponse(res, 200, "restaurant data updated succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Edit Logo Controller *********************** */
export const editLogo = async (req: Request, res: Response) => {
  try {
    // If no file is present
    if (!req.file) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    if (!req.restaurantData) {
      return sendResponse(res, 500, "internal server error");
    }

    const newLogoFilePath = `/${req.file?.destination}/${req.file?.filename}`;
    const currentRestaurantData = req.restaurantData;

    // Delete old file
    // ONLY requied if the mimetype of the new file is different from the current file
    // IF its the same mimetype multer handles it
    if (
      currentRestaurantData.logo_file_path !== null &&
      newLogoFilePath !== currentRestaurantData.logo_file_path
    ) {
      // Delete old file
      await deleteFile(currentRestaurantData.logo_file_path);
    }

    const newRestaurantData = {
      ...currentRestaurantData,
      logo_file_path: newLogoFilePath,
    };

    const validatedData = RestaurantSchema.parse(newRestaurantData);

    await updateProfile(validatedData);

    return sendResponse(res, 200, "logo updated succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Delete Logo Controller *********************** */
export const deleteLogo = async (req: Request, res: Response) => {
  try {
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    // Fetch current restaurant data.
    const currentRestaurantData = await getRestaurantById(restaurantId);

    if (!currentRestaurantData) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if restaurant is related to the req user
    if (currentRestaurantData.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // If the logo is not null delete it
    if (currentRestaurantData.logo_file_path !== null) {
      // Delete old file
      await deleteFile(currentRestaurantData.logo_file_path);
    }

    // Override logo_file_path to null and update the data
    const newRestaurantData = {
      ...currentRestaurantData,
      logo_file_path: null,
    };

    // Validate the new data before updating it
    const validatedData = RestaurantSchema.parse(newRestaurantData);

    await updateProfile(validatedData);

    return sendResponse(res, 200, "logo deleteted succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Edit Cover Controller *********************** */
export const editCover = async (req: Request, res: Response) => {
  try {
    // If no file is present
    if (!req.file) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    if (!req.restaurantData) {
      return sendResponse(res, 500, "internal server error");
    }

    const newCoverFilePath = `/${req.file?.destination}/${req.file?.filename}`;

    const currentRestaurantData = req.restaurantData;

    // Delete old file
    // ONLY requied if the mimetype of the new file is different from the current file
    // IF its the same mimetype multer handles it
    if (
      currentRestaurantData.cover_file_path !== null &&
      newCoverFilePath !== currentRestaurantData.cover_file_path
    ) {
      // Delete old file
      await deleteFile(currentRestaurantData.cover_file_path);
    }

    const newRestaurantData = {
      ...currentRestaurantData,
      cover_file_path: newCoverFilePath,
    };

    const validatedData = RestaurantSchema.parse(newRestaurantData);

    // Update the restaurant data with the new path
    await updateProfile(validatedData);

    return sendResponse(res, 200, "cover updated succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Delete Cover Controller *********************** */
export const deleteCover = async (req: Request, res: Response) => {
  try {
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    // Fetch current restaurant data.
    const currentRestaurantData = await getRestaurantById(restaurantId);

    if (!currentRestaurantData) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if restaurant is related to the req user
    if (currentRestaurantData.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // If the cover is not null delete it
    if (currentRestaurantData.cover_file_path !== null) {
      // Delete old file
      await deleteFile(currentRestaurantData.cover_file_path);
    }

    // Override logo_file_path to null and update the data
    const newRestaurantData = {
      ...currentRestaurantData,
      cover_file_path: null,
    };

    // Validate the new data before updating it
    const validatedData = RestaurantSchema.parse(newRestaurantData);

    await updateProfile(validatedData);

    return sendResponse(res, 200, "cover deleteted succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
