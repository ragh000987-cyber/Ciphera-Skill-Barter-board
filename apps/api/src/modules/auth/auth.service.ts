```typescript
import bcrypt from "bcryptjs";

import { prisma } from "../../config/database";
import { ApiError } from "../../utils/api-error";

import type {
  LoginInput,
  RegisterInput
} from "./auth.schema";

const SALT_ROUNDS = 12;

export class AuthService {
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email
      },
      select: {
        id: true
      }
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "An account with this email already exists.",
        "EMAIL_ALREADY_REGISTERED"
      );
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      SALT_ROUNDS
    );

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        role: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    return user;
  }

  static async verifyCredentials(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    // Use a dummy hash when the account does not exist.
    // This reduces the timing difference between login failures.
    const dummyHash =
      "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6M3QfQ9L0wM4y7jKJq5XqK7w8v6uG";

    const passwordMatches = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? dummyHash
    );

    if (
      !user ||
      !passwordMatches ||
      !user.isActive
    ) {
      throw new ApiError(
        401,
        "Invalid email or password.",
        "INVALID_CREDENTIALS"
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        location: true,
        timeZone: true,
        isEmailVerified: true,
        role: true,
        averageRating: true,
        completedExchanges: true,
        reputationPoints: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new ApiError(
        404,
        "User account was not found.",
        "USER_NOT_FOUND"
      );
    }

    return user;
  }
}
```
