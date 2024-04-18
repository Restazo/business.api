import multer from "multer";
import path from "path";

import { Request, Response, NextFunction } from "express";

import sendResponse from "../lib/api-response.js";
import { getRestaurantById } from "../data/restaurant.js";

import { UUIDSchema } from "../schemas/schemas.js";

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Define allowed file types
  const allowedFileTypes = JSON.parse(process.env.ALLOWED_FILE_TYPES);

  // Check if the uploaded file's MIME type is in the allowed types array
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.multerError = "unsupported file format";
    cb(null, false);
  }
};

// Define storage
const diskStorage = multer.diskStorage({
  // Here we define paths for different fieldnames
  destination: (req, file, cb) => {
    let uploadPath = "public/";
    if (file.fieldname === "logo") {
      uploadPath += "logos";
    } else if (file.fieldname === "cover") {
      uploadPath += "covers";
    } else if (file.fieldname === "itemImage") {
      uploadPath += "food_items";
    }
    cb(null, uploadPath);
  },
  // Here we define the filename to be stored
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const restaurantId = req.params.restaurantId;
    cb(null, `${restaurantId}${extension}`);
  },
});

const diskUpload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  // Define the size limit here,
  limits: { fileSize: Number(process.env.FILE_SIZE_LIMIT) },
});

// Define storage
const memoryStorage = multer.memoryStorage();

const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  // Define the size limit here,
  limits: { fileSize: Number(process.env.FILE_SIZE_LIMIT) },
});

// Custom middleware function to enable catching errors
export const multerMemoryMiddleware =
  (fieldName: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // Use multer to store the file provided
    memoryUpload.single(fieldName)(req, res, (error) => {
      // Check if any multerError on req
      if (req.multerError) {
        const data = JSON.parse(process.env.ALLOWED_FILE_TYPES);
        return sendResponse(res, 400, req.multerError, {
          supportedFormats: data,
        });
      }

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          const sizeLimit = Number(process.env.FILE_SIZE_LIMIT);
          return sendResponse(res, 400, `file size exceeded the size limit`, {
            sizeLimitInBytes: sizeLimit,
          });
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return sendResponse(res, 400, "invalid input or missing fields");
        }
        console.error(error);
        return sendResponse(res, 400, `${error.message?.toLowerCase()}`, error);
      } else if (error) {
        console.error(error);
        return sendResponse(res, 500, "internal server error");
      }
      next();
    });
  };

// Custom middleware function to enable catching errors
export const multerDiskMiddleware =
  (fieldName: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }

    const restaurantId = validatedParameter.data;

    const restaurantData = await getRestaurantById(restaurantId);

    if (!restaurantData) {
      return sendResponse(res, 404, "no restaurant found");
    }
    // Check if authorized
    if (restaurantData.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Set restaurantData for next function
    req.restaurantData = restaurantData;

    // Use multer to store the file provided
    diskUpload.single(fieldName)(req, res, (error) => {
      // Check if any multerError on req
      if (req.multerError) {
        const data = JSON.parse(process.env.ALLOWED_FILE_TYPES);
        return sendResponse(res, 400, req.multerError, {
          supportedFormats: data,
        });
      }

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          const sizeLimit = Number(process.env.FILE_SIZE_LIMIT);
          return sendResponse(res, 400, `file size exceeded the size limit`, {
            sizeLimitInBytes: sizeLimit,
          });
        }
        console.error(error);
        return sendResponse(res, 400, `${error.message?.toLowerCase()}`, error);
      } else if (error) {
        console.error(error);
        return sendResponse(res, 500, "internal server error");
      }
      next();
    });
  };
