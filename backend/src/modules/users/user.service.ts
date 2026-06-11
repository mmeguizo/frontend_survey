import { User, Role } from "@prisma/client";
import argon2 from "argon2";
import { prisma } from "../../lib/prisma";
import { UserRepository, userRepository } from "./user.repository";
import { StorageService, storageService } from "../storage/storage.service";
import { JWTService, jwtService } from "../auth/jwt.service";
import { googleAuthService } from "../auth/google-auth.service";
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../../lib/errors";
import { logger } from "../../lib/logger";
import {
  createUserSchema,
  updateProfileSchema,
  setPasswordSchema,
  loginSchema,
  type CreateUserInput,
  type UpdateProfileInput,
  type SetPasswordInput,
  type LoginInput,
} from "./user.validators";

export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly storage: StorageService,
    private readonly jwt: JWTService,
  ) {}

  async getById(id: number): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async getAll(): Promise<User[]> {
    logger.info("Fetching all users");
    return this.userRepo.findAll();
  }

  async create(input: CreateUserInput): Promise<User> {
    const validation = createUserSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError("Invalid user data", validation.error.format());
    }

    const { email, name, password, role } = validation.data;

    // Check if user already exists
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError("User with this email already exists");
    }

    logger.info(`Creating new user: ${email}`);

    // Hash password if provided
    const hashedPassword = password ? await argon2.hash(password) : null;

    return this.userRepo.create({
      email,
      name: name ?? null,
      password: hashedPassword,
      role: role as Role | undefined,
    });
  }

  async updateProfile(
    userId: number,
    input: UpdateProfileInput,
  ): Promise<User> {
    // console.log('UpdateProfile Input:', input);
    const validation = updateProfileSchema.safeParse(input);
    // console.log('Validation Result:', validation);
    if (!validation.success) {
      throw new ValidationError(
        "Invalid profile data",
        validation.error.format(),
      );
    }

    const data: any = {};

    if (typeof input.name !== "undefined") {
      data.name = input.name;
    }

    if (input.avatarDataUrl) {
      logger.debug(`Processing avatar for user ${userId}`);
      const avatarUrl = await this.storage.saveAvatarFromDataUrl(
        input.avatarDataUrl,
      );
      data.avatarUrl = avatarUrl;
      data.picture = avatarUrl;
      logger.info(`Avatar saved for user ${userId}`);
    }

    return this.userRepo.update(userId, data);
  }

  async setPassword(userId: number, input: SetPasswordInput): Promise<User> {
    const validation = setPasswordSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError("Invalid password", validation.error.format());
    }

    logger.info(`Setting password for user ${userId}`);
    const hashedPassword = await argon2.hash(input.password);

    return this.userRepo.update(userId, { password: hashedPassword });
  }

  async setUserRole(userId: number, role: Role): Promise<User> {
    logger.info(`Setting role ${role} for user ${userId}`);
    return this.userRepo.update(userId, { role });
  }

  /**
   * Get all users with a specific role
   * Used for assignment dropdowns (e.g., get all DEVELOPERs)
   */
  async getByRole(role: Role): Promise<User[]> {
    logger.info(`Fetching users with role: ${role}`);
    return this.userRepo.findByRole(role);
  }

  /**
   * Get all users with any of the specified roles
   * Used for getting staff from multiple categories
   */
  async getByRoles(roles: Role[]): Promise<User[]> {
    logger.info(`Fetching users with roles: ${roles.join(", ")}`);
    return this.userRepo.findByRoles(roles);
  }

  async login(input: LoginInput): Promise<{ token: string; user: User }> {
    const validation = loginSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        "Invalid login credentials",
        validation.error.format(),
      );
    }

    const { email, password } = validation.data;

    logger.info(`Login attempt for: ${email}`);

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      logger.warn(`Login failed: user not found - ${email}`);
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      logger.warn(`Login failed: account deactivated - ${email}`);
      throw new UnauthorizedError(
        "Your account has been deactivated. Please contact an administrator.",
      );
    }

    if (!user.password) {
      logger.warn(`Login failed: no password set - ${email}`);
      throw new UnauthorizedError(
        "This account uses Google Sign-In. Please sign in with Google.",
      );
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      logger.warn(`Login failed: invalid password - ${email}`);
      throw new UnauthorizedError("Invalid email or password");
    }

    // Update last login
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const token = await this.jwt.sign(user.id, user.email, user.role);

    logger.info(`Login successful for user ${user.id}`);
    return { token, user };
  }

  async googleAuth(
    code: string,
    redirectUri: string,
  ): Promise<{ token: string; user: User }> {
    const tokens = await googleAuthService.exchangeCodeForToken(code, redirectUri);
    if (!tokens) {
      throw new UnauthorizedError("Failed to exchange Google authorization code");
    }

    const googleUser = await googleAuthService.verifyIdToken(tokens.id_token);
    if (!googleUser) {
      throw new UnauthorizedError("Failed to verify Google ID token");
    }

    if (!googleUser.sub) {
      throw new UnauthorizedError("Invalid Google user profile: missing subject");
    }

    let email = googleUser.email || `${googleUser.sub}@google.com`;
    let name = googleUser.name || null;
    let picture = googleUser.picture || null;

    if (!googleUser.email || !googleUser.name) {
      const userInfo = await googleAuthService.fetchUserInfo(tokens.access_token);
      if (userInfo) {
        email = userInfo.email || email;
        name = userInfo.name || name;
        picture = userInfo.picture || picture;
      }
    }

    const result = await this.upsertFromGoogle(googleUser.sub, email, name, picture);

    if (!result.user.isActive) {
      logger.warn(`Google login blocked: account deactivated - ${result.user.email}`);
      throw new UnauthorizedError(
        "Your account has been deactivated. Please contact an administrator.",
      );
    }

    await this.userRepo.update(result.user.id, { lastLoginAt: new Date() });

    const token = await this.jwt.sign(
      result.user.id,
      result.user.email,
      result.user.role,
    );

    logger.info(`Google login successful for user ${result.user.id}`);
    return { token, user: result.user };
  }

  async upsertFromGoogle(
    externalId: string,
    email: string,
    name?: string | null,
    picture?: string | null,
  ): Promise<{ user: User; created: boolean }> {
    logger.info(`Upserting user from Google: ${externalId}`);

    // Download avatar if it's a remote URL
    let avatarUrl: string | null = null;
    const existing = await this.userRepo.findByExternalId(externalId);

    if (!existing?.avatarUrl && picture && this.isHttpUrl(picture)) {
      avatarUrl = await this.storage.saveAvatarFromRemoteUrl(picture);
    }

    // --- SSO Account Linking ---
    // If no user found by externalId, check if an admin pre-created a user with this email.
    // If found, link the externalId to that existing user so both SSO and local password work.
    if (!existing) {
      const byEmail = await this.userRepo.findByEmail(email);
      if (byEmail) {
        logger.info(
          `Linking SSO externalId ${externalId} to existing user ${byEmail.id} (${email})`,
        );
        const updatedUser = await this.userRepo.update(byEmail.id, {
          externalId,
          name: name ?? byEmail.name,
          picture: picture ?? byEmail.picture,
          avatarUrl: avatarUrl ?? byEmail.avatarUrl,
          lastLoginAt: new Date(),
        } as any);
        return { user: updatedUser, created: false };
      }
    }

    return this.userRepo.upsertByExternalId(
      externalId,
      {
        email,
        name: name ?? null,
        picture: picture ?? null,
        avatarUrl: avatarUrl ?? picture ?? null,
      },
      {
        email,
        name: name ?? null,
        picture: picture ?? null,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    );
  }

  private isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
  }

  /**
   * Toggle user active/inactive status
   * Admin cannot deactivate themselves
   */
  async toggleUserActive(userId: number, adminId: number): Promise<User> {
    if (userId === adminId) {
      throw new ValidationError("Cannot deactivate your own account");
    }

    const user = await this.userRepo.findByIdOrThrow(userId);
    const isActive = !user.isActive;

    logger.info(
      `${isActive ? "Activating" : "Deactivating"} user ${userId} by admin ${adminId}`,
    );

    return this.userRepo.update(userId, {
      isActive,
      deactivatedAt: isActive ? null : new Date(),
      deactivatedById: isActive ? null : adminId,
    } as any);
  }

  /**
   * Delete a user permanently
   * Admin cannot delete themselves
   */
  async deleteUser(userId: number, adminId: number): Promise<void> {
    if (userId === adminId) {
      throw new ValidationError("Cannot delete your own account");
    }

    const user = await this.userRepo.findByIdOrThrow(userId);

    // Block deletion if user has open (unresolved) tickets they created
    const openTickets = await prisma.ticket.count({
      where: {
        createdById: userId,
        status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] },
      },
    });
    if (openTickets > 0) {
      throw new ValidationError(
        `Cannot delete user: they have ${openTickets} open ticket(s). Deactivate the account instead to preserve ticket history.`,
      );
    }

    // Block deletion if user is currently assigned to active tickets
    const assignedTickets = await prisma.ticketAssignment.count({
      where: {
        userId,
        ticket: { status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] } },
      },
    });
    if (assignedTickets > 0) {
      throw new ValidationError(
        `Cannot delete user: they are assigned to ${assignedTickets} active ticket(s). Reassign or resolve those tickets first.`,
      );
    }

    logger.warn("Admin permanently deleted a user account", {
      action: "HARD_DELETE_USER",
      userId,
      userEmail: (user as any).email,
      adminId,
      at: new Date(),
    });

    // Delete all related records before deleting the user to avoid FK violations
    await prisma.$transaction([
      // Reassign tickets created by this user to the admin doing the deletion
      prisma.ticket.updateMany({
        where: { createdById: userId },
        data: { createdById: adminId },
      }),
      // Nullify nullable review/approval references on tickets
      prisma.ticket.updateMany({
        where: { secretaryReviewedById: userId },
        data: { secretaryReviewedById: null },
      }),
      prisma.ticket.updateMany({
        where: { directorApprovedById: userId },
        data: { directorApprovedById: null },
      }),
      // Nullify deactivatedById on other users deactivated by this user
      prisma.user.updateMany({
        where: { deactivatedById: userId },
        data: { deactivatedById: null },
      }),
      prisma.ticketAssignment.deleteMany({ where: { userId } }),
      prisma.ticketNote.deleteMany({ where: { userId } }),
      prisma.ticketStatusHistory.deleteMany({ where: { userId } }),
      prisma.clientSatisfactionSurvey.deleteMany({ where: { userId } }),
      prisma.knowledgeArticle.deleteMany({ where: { createdById: userId } }),
      prisma.chatSession.deleteMany({ where: { userId } }),
      prisma.troubleshootingSolution.deleteMany({ where: { createdById: userId } }),
      // TicketAttachment has nullable FK, so set to null instead of deleting
      prisma.ticketAttachment.updateMany({
        where: { uploadedById: userId },
        data: { uploadedById: null },
      }),
      prisma.ticketAttachment.updateMany({
        where: { deletedById: userId },
        data: { deletedById: null },
      }),
      prisma.userSkill.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  async getUserSkills(userId: number): Promise<string[]> {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      orderBy: { skill: "asc" },
    });
    return userSkills.map((us) => us.skill);
  }

  async updateUserSkills(userId: number, skills: string[]): Promise<User> {
    logger.info(`Updating skills for user ${userId}: ${skills.join(", ")}`);

    // Check if user exists
    const user = await this.userRepo.findByIdOrThrow(userId);

    // Run in transaction to delete old and insert new
    await prisma.$transaction([
      prisma.userSkill.deleteMany({
        where: { userId },
      }),
      prisma.userSkill.createMany({
        data: skills.map((skill) => ({
          userId,
          skill: skill.trim().toUpperCase(),
        })),
        skipDuplicates: true,
      }),
    ]);

    return user;
  }
}

export const userService = new UserService(
  userRepository,
  storageService,
  jwtService,
);
