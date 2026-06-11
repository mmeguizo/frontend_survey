import { User } from "@prisma/client";
import type { IncomingMessage } from "http";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";
import { jwtService } from "./modules/auth/jwt.service";
import { userService } from "./modules/users/user.service";

export interface GraphQLContext {
  currentUser: User | null;
  userService: typeof userService;
  jwtService: typeof jwtService;
}

export async function createContext({
  req,
}: {
  req: IncomingMessage;
}): Promise<GraphQLContext> {
  const authHeader = (req.headers?.authorization || "").toString();
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  let currentUser: (User & { wasCreated?: boolean }) | null = null;

  if (token) {
    const jwtUser = await jwtService.verify(token);
    if (jwtUser) {
      const userId = parseInt(jwtUser.sub, 10);
      if (!isNaN(userId)) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          if (!user.isActive) {
            logger.warn(
              `JWT login blocked: account deactivated - ${user.email}`,
            );
          } else {
            currentUser = user;
          }
        }
      }
    }
  }

  return {
    currentUser,
    userService,
    jwtService,
  };
}
