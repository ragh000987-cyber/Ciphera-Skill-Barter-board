```typescript
import { createServer } from "node:http";

import app from "./app";

import { env } from "./config/env";

import {
  connectDatabase,
  disconnectDatabase
} from "./config/database";

const server = createServer(app);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    server.listen(env.PORT, () => {
      console.log(
        `Skill Barter Board API running on port ${env.PORT}`
      );

      console.log(
        `Health check: http://localhost:${env.PORT}/health`
      );
    });
  } catch (error) {
    console.error("Failed to start the API server:", error);

    process.exitCode = 1;
  }
}

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received. Shutting down gracefully.`);

  server.close(async (error) => {
    try {
      await disconnectDatabase();
    } catch (disconnectError) {
      console.error(
        "Database disconnection failed:",
        disconnectError
      );

      process.exitCode = 1;
    }

    if (error) {
      console.error("Server shutdown failed:", error);
      process.exitCode = 1;
    }

    process.exit();
  });
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

void startServer();
```
