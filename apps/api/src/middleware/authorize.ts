```typescript
import type { RequestHandler } from "express";

import { ApiError } from "../utils/api-error";

type UserRole = "USER" | "MODERATOR" | "ADMIN";

export function authorize(
  ...allowedRoles: UserRole[]
): RequestHandler {
  return (req, _res, next) => {
    if (!req.currentUser) {
      return next(
        new ApiError(
          401,
          "Authentication is required.",
          "UNAUTHENTICATED"
        )
      );
    }

    if (!allowedRoles.includes(req.currentUser.role)) {
      return next(
        new ApiError(
          403,
          "You do not have permission to perform this action.",
          "FORBIDDEN"
        )
      );
    }

    next();
  };
}
```
