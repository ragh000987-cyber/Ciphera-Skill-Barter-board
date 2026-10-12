```typescript
import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export function validateBody(
  schema: ZodType
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;

    next();
  };
}

export function validateQuery(
  schema: ZodType
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(result.error);
    }

    Object.assign(req.query, result.data);

    next();
  };
}

export function validateParams(
  schema: ZodType
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(result.error);
    }

    next();
  };
}
```
