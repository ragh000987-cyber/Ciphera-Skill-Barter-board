import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";

import {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  searchUserProfiles,
} from "./users.controller";

const router = Router();

// Search public profiles.
router.get("/search", searchUserProfiles);

// Get the currently logged-in user's profile.
router.get("/me", authenticate, getMyProfile);

// Update the currently logged-in user's profile.
router.patch("/me", authenticate, updateMyProfile);

// Get another user's public profile.
router.get("/:userId", getPublicProfile);

export default router;
