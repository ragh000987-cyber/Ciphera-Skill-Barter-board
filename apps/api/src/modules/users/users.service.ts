import { prisma } from "../../config/database";
import { ApiError } from "../../utils/api-error";

const publicUserSelect = {
  id: true,
  name: true,
  bio: true,
  avatarUrl: true,
  location: true,
  timeZone: true,
  averageRating: true,
  completedExchanges: true,
  reputationPoints: true,
  createdAt: true,
} as const;

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, isActive: true },
    select: {
      ...publicUserSelect,
      skills: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User profile not found", "USER_NOT_FOUND");
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  input: {
    name?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    timeZone?: string;
  }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: publicUserSelect,
  });
}

export async function searchUsers(query: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    OR: [
      { name: { contains: query, mode: "insensitive" as const } },
      { bio: { contains: query, mode: "insensitive" as const } },
      { location: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: { reputationPoints: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
