import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import "./config.js";

import deserializeUser from "./middleware/deserializeUser.js";
import authenticationRoutes from "./routes/authenticationRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";

import sendResponse from "./lib/api-response.js";

const app = express();

if (process.env.ENV === "dev") {
  console.log("Running in development mode");
  app.use(morgan("dev"));
}

app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(deserializeUser); // use this middleware in every route

app.use(express.json());

app.use("/auth", authenticationRoutes);
app.use("/business", businessRoutes);
app.use("/restaurants", restaurantRoutes, tableRoutes);

// Respond if none of the endpoints matched
app.all("*", (req, res, next) => {
  return sendResponse(
    res,
    404,
    `No ${req.method} method for ${req.originalUrl} route on the server`
  );
});

app.listen(process.env.API_PORT, () => {
  console.log(`Server is running on port ${process.env.API_PORT}`);
});
