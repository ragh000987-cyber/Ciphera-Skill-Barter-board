```typescript
import type {
  Request,
  Response,
  NextFunction
} from "express";

import { AuthService } from "./auth.service";
import { ApiError } from "../../utils/api-error";

export class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        message: "Account created successfully.",
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await AuthService.verifyCredentials(
        req.body
      );

      // Prevent session fixation by replacing the session.
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      req.session.userId = user.id;

      await new Promise<void>((resolve, reject) => {
        req.session.save((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      res.status(200).json({
        success: true,
        message: "Login successful.",
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie(
        process.env.SESSION_COOKIE_NAME ??
          "skillbarter.sid",
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/"
        }
      );

      res.status(200).json({
        success: true,
        message: "Logout successful."
      });
    });
  }

  static async me(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.currentUser) {
        throw new ApiError(
          401,
          "Please log in to continue.",
          "UNAUTHENTICATED"
        );
      }

      const user = await AuthService.getCurrentUser(
        req.currentUser.id
      );

      res.status(200).json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
```
