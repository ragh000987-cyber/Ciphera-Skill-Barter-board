```typescript
import { Router } from "express";

import { AuthController } from "./auth.controller";

import {
  loginSchema,
  registerSchema
} from "./auth.schema";

import { validateBody } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authRateLimit } from "../../middleware/rate-limit";

const router = Router();

router.post(
  "/register",
  authRateLimit,
  validateBody(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  authRateLimit,
  validateBody(loginSchema),
  AuthController.login
);

router.post(
  "/logout",
  authenticate,
  AuthController.logout
);

router.get(
  "/me",
  authenticate,
  AuthController.me
);

export default router;
```
