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

const app = express();

// Trust the reverse proxy in production deployments.
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers.
app.use(helmet());

// Allow requests from the frontend.
app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse incoming request bodies.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// HTTP request logging.
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Apply general API rate limiting.
app.use("/api", generalRateLimit);

// Session configuration.
//
// The default MemoryStore is suitable only for initial development.
// Replace it with a persistent session store before production.
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
      maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    },
  })
);

// Health-check endpoint.
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Skill Barter Board API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API version 1.
app.use("/api/v1/auth", authRoutes);

// Return a 404 response for unknown routes.
app.use(notFoundHandler);

// Handle application errors.
app.use(errorHandler);

export default app;
