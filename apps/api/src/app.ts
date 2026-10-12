import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";

import { env } from "./config/env";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler";

import { generalRateLimit } from "./middleware/rate-limit";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";

const app = express();

// Trust the reverse proxy in production.
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers.
app.use(helmet());

// Frontend connection.
app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request body parsing.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// HTTP request logging.
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Rate limiting.
app.use("/api", generalRateLimit);

// Session configuration.
// Replace MemoryStore with a persistent session store before production.
app.use(
  session({
    name: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:
        env.SESSION_MAX_AGE_DAYS *
        24 *
        60 *
        60 *
        1000,
    },
  })
);

// Health check.
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Skill Barter Board API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API version 1 routes.
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// Handle unknown routes.
app.use(notFoundHandler);

// Central error handler.
app.use(errorHandler);

export default app;
