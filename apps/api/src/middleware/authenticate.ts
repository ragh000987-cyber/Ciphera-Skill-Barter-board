```typescript
import type { RequestHandler } from "express";
import { prisma } from "../config/database";
import { ApiError } from "../utils/api-error";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        id: string;
        role: "USER" | "MODERATOR" | "ADMIN";
        email: string;
        name: string;
      };
    }
  }
}

export const authenticate: RequestHandler = async (
  req,
  _res,
  next
) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      throw new ApiError(
        401,
        "Please log in to continue.",
        "UNAUTHENTICATED"
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      req.session.destroy(() => undefined);

      throw new ApiError(
        401,
        "Your session is invalid. Please log in again.",
        "INVALID_SESSION"
      );
    }

    req.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};
```
