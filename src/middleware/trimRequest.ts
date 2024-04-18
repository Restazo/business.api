import { NextFunction, Request, Response } from "express";

type Trimmable = {
  [key: string]: string | Trimmable;
};

const trimStrings = (obj: Trimmable) => {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      obj[key] = value.trim();
    } else if (typeof value === "object" && !Array.isArray(value)) {
      trimStrings(value);
    }
  }
};

const trimRequestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    trimStrings(req.body);
  }
  next();
};

export default trimRequestMiddleware;
