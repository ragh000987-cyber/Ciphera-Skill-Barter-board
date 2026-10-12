```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";

import { env } from "./config/env";

import {
  errorHandler,
  notFoundHandler
} from "./middleware/error-handler";

import {
  generalRateLimit
} from "./middleware/rate-limit";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);

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
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "X-CSRF-Token"
    ]
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api", generalRateLimit);

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

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
        1000
    }
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Skill Barter Board API is running.",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/v1", (_req, res) => {
  res.status(200).json({
    success: true,
    name: "Skill Barter Board API",
    version: "1.0.0",
    message: "Welcome to the Skill Barter Board API."
  });
});

// Feature routes will be registered here as we implement them.

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
```
