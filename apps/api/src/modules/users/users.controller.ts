import type { Request, Response, NextFunction } from "express";

import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
} from "./users.service";

import {
  updateProfileSchema,
  searchUsersSchema,
} from "./users.schema";

import { ApiError } from "../../utils/api-error";

export async function getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.userId) {
      throw new ApiError(401, "Please log in", "UNAUTHENTICATED");
    }

    const profile = await getUserProfile(req.session.userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.userId) {
      throw new ApiError(401, "Please log in", "UNAUTHENTICATED");
    }

    const input = updateProfileSchema.parse(req.body);

    const profile = await updateUserProfile(
      req.session.userId,
      input
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId;

    if (!userId) {
      throw new ApiError(400, "User ID is required", "INVALID_USER_ID");
    }

    const profile = await getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchUserProfiles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters = searchUsersSchema.parse(req.query);

    const result = await searchUsers(
      filters.q,
      filters.page,
      filters.limit
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
