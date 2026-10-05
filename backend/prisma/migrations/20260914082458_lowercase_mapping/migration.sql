/*
  Warnings:

  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientSatisfactionSurvey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ITSTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KnowledgeArticle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MISTicket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketCounter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TicketStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TroubleshootingSolution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSkill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ChatMessage` DROP FOREIGN KEY `ChatMessage_sessionId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatSession` DROP FOREIGN KEY `ChatSession_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatSession` DROP FOREIGN KEY `ChatSession_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ClientSatisfactionSurvey` DROP FOREIGN KEY `ClientSatisfactionSurvey_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `ClientSatisfactionSurvey` DROP FOREIGN KEY `ClientSatisfactionSurvey_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ITSTicket` DROP FOREIGN KEY `ITSTicket_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `KnowledgeArticle` DROP FOREIGN KEY `KnowledgeArticle_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `MISTicket` DROP FOREIGN KEY `MISTicket_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `TicketAssignment` DROP FOREIGN KEY `TicketAssignment_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `TicketAssignment` DROP FOREIGN KEY `TicketAssignment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `TicketAttachment` DROP FOREIGN KEY `TicketAttachment_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `TicketNote` DROP FOREIGN KEY `TicketNote_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `TicketNote` DROP FOREIGN KEY `TicketNote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `TicketStatusHistory` DROP FOREIGN KEY `TicketStatusHistory_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `TicketStatusHistory` DROP FOREIGN KEY `TicketStatusHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `TroubleshootingSolution` DROP FOREIGN KEY `TroubleshootingSolution_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `TroubleshootingSolution` DROP FOREIGN KEY `TroubleshootingSolution_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSkill` DROP FOREIGN KEY `UserSkill_userId_fkey`;

-- DropTable
DROP TABLE `ChatMessage`;

-- DropTable
DROP TABLE `ChatSession`;

-- DropTable
DROP TABLE `ClientSatisfactionSurvey`;

-- DropTable
DROP TABLE `ITSTicket`;

-- DropTable
DROP TABLE `KnowledgeArticle`;

-- DropTable
DROP TABLE `MISTicket`;

-- DropTable
DROP TABLE `Notification`;

-- DropTable
DROP TABLE `Ticket`;

-- DropTable
DROP TABLE `TicketAssignment`;

-- DropTable
DROP TABLE `TicketCounter`;

-- DropTable
DROP TABLE `TicketNote`;

-- DropTable
DROP TABLE `TicketStatusHistory`;

-- DropTable
DROP TABLE `TroubleshootingSolution`;

-- DropTable
DROP TABLE `UserSkill`;

-- CreateTable
CREATE TABLE `userskill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `skill` VARCHAR(191) NOT NULL,

    INDEX `userskill_userId_idx`(`userId`),
    INDEX `userskill_skill_idx`(`skill`),
    UNIQUE INDEX `userskill_userId_skill_key`(`userId`, `skill`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketNumber` VARCHAR(191) NOT NULL,
    `controlNumber` VARCHAR(191) NULL,
    `type` ENUM('MIS', 'ITS') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('FOR_REVIEW', 'REVIEWED', 'DIRECTOR_APPROVED', 'ASSIGNED', 'PENDING', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'FOR_REVIEW',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `dueDate` DATETIME(3) NULL,
    `estimatedDuration` INTEGER NULL,
    `actualDuration` INTEGER NULL,
    `secretaryReviewedById` INTEGER NULL,
    `secretaryReviewedAt` DATETIME(3) NULL,
    `directorApprovedById` INTEGER NULL,
    `directorApprovedAt` DATETIME(3) NULL,
    `assignedDeveloperName` VARCHAR(191) NULL,
    `dateToVisit` DATETIME(3) NULL,
    `targetCompletionDate` DATETIME(3) NULL,
    `resolution` TEXT NULL,
    `dateFinished` DATETIME(3) NULL,
    `escalatedAt` DATETIME(3) NULL,
    `escalationLevel` INTEGER NOT NULL DEFAULT 0,
    `satisfactionRating` INTEGER NULL,
    `satisfactionComment` TEXT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ticket_ticketNumber_key`(`ticketNumber`),
    UNIQUE INDEX `ticket_controlNumber_key`(`controlNumber`),
    INDEX `ticket_status_idx`(`status`),
    INDEX `ticket_createdById_idx`(`createdById`),
    INDEX `ticket_type_idx`(`type`),
    INDEX `ticket_dueDate_idx`(`dueDate`),
    INDEX `ticket_priority_idx`(`priority`),
    INDEX `ticket_createdAt_idx`(`createdAt`),
    INDEX `ticket_resolvedAt_idx`(`resolvedAt`),
    INDEX `ticket_escalationLevel_idx`(`escalationLevel`),
    INDEX `ticket_type_status_idx`(`type`, `status`),
    INDEX `ticket_dueDate_status_idx`(`dueDate`, `status`),
    FULLTEXT INDEX `ticket_title_description_idx`(`title`, `description`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `misticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `category` ENUM('WEBSITE', 'SOFTWARE') NOT NULL,
    `websiteNewRequest` BOOLEAN NOT NULL DEFAULT false,
    `websiteUpdate` BOOLEAN NOT NULL DEFAULT false,
    `softwareNewRequest` BOOLEAN NOT NULL DEFAULT false,
    `softwareUpdate` BOOLEAN NOT NULL DEFAULT false,
    `softwareInstall` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `misticket_ticketId_key`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itsticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `borrowRequest` BOOLEAN NOT NULL DEFAULT false,
    `borrowDetails` TEXT NULL,
    `maintenanceDesktopLaptop` BOOLEAN NOT NULL DEFAULT false,
    `maintenanceInternetNetwork` BOOLEAN NOT NULL DEFAULT false,
    `maintenancePrinter` BOOLEAN NOT NULL DEFAULT false,
    `maintenanceDetails` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `itsticket_ticketId_key`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticketassignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticketassignment_userId_idx`(`userId`),
    UNIQUE INDEX `ticketassignment_ticketId_userId_key`(`ticketId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticketnote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `isInternal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ticketnote_ticketId_idx`(`ticketId`),
    INDEX `ticketnote_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticketstatushistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `fromStatus` ENUM('FOR_REVIEW', 'REVIEWED', 'DIRECTOR_APPROVED', 'ASSIGNED', 'PENDING', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED') NULL,
    `toStatus` ENUM('FOR_REVIEW', 'REVIEWED', 'DIRECTOR_APPROVED', 'ASSIGNED', 'PENDING', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED') NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticketstatushistory_ticketId_idx`(`ticketId`),
    INDEX `ticketstatushistory_ticketId_userId_idx`(`ticketId`, `userId`),
    INDEX `ticketstatushistory_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticketcounter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `counter` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ticketcounter_year_month_key`(`year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `ticketId` INTEGER NULL,
    `type` ENUM('TICKET_CREATED', 'TICKET_REVIEWED', 'TICKET_REJECTED', 'TICKET_APPROVED', 'TICKET_DISAPPROVED', 'TICKET_ASSIGNED', 'STATUS_CHANGED', 'NOTE_ADDED', 'ATTACHMENT_ADDED', 'SLA_BREACH', 'TICKET_ESCALATED') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_userId_isRead_idx`(`userId`, `isRead`),
    INDEX `notification_ticketId_idx`(`ticketId`),
    INDEX `notification_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `knowledgearticle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `tags` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `helpfulCount` INTEGER NOT NULL DEFAULT 0,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `knowledgearticle_category_idx`(`category`),
    INDEX `knowledgearticle_status_idx`(`status`),
    INDEX `knowledgearticle_createdById_idx`(`createdById`),
    INDEX `knowledgearticle_createdAt_idx`(`createdAt`),
    FULLTEXT INDEX `knowledgearticle_title_content_idx`(`title`, `content`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatsession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'New Chat',
    `status` ENUM('ACTIVE', 'CLOSED', 'TICKET_CREATED') NOT NULL DEFAULT 'ACTIVE',
    `ticketId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chatsession_userId_idx`(`userId`),
    INDEX `chatsession_status_idx`(`status`),
    INDEX `chatsession_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatmessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `content` TEXT NOT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chatmessage_sessionId_idx`(`sessionId`),
    INDEX `chatmessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `troubleshootingsolution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `problem` TEXT NOT NULL,
    `solution` LONGTEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `tags` TEXT NULL,
    `visibility` VARCHAR(191) NOT NULL DEFAULT 'INTERNAL',
    `ticketId` INTEGER NULL,
    `createdById` INTEGER NOT NULL,
    `embedding` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `troubleshootingsolution_category_idx`(`category`),
    INDEX `troubleshootingsolution_visibility_idx`(`visibility`),
    INDEX `troubleshootingsolution_createdById_idx`(`createdById`),
    INDEX `troubleshootingsolution_createdAt_idx`(`createdAt`),
    FULLTEXT INDEX `troubleshootingsolution_problem_solution_idx`(`problem`, `solution`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientsatisfactionsurvey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `clientType` VARCHAR(191) NULL,
    `date` VARCHAR(191) NULL,
    `sex` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `regionOfResidence` VARCHAR(191) NULL,
    `serviceTalisay` BOOLEAN NOT NULL DEFAULT false,
    `serviceExternal` BOOLEAN NOT NULL DEFAULT false,
    `cc1Awareness` INTEGER NULL,
    `cc2Visibility` INTEGER NULL,
    `cc3Helpfulness` INTEGER NULL,
    `sqd0` INTEGER NULL,
    `sqd1` INTEGER NULL,
    `sqd2` INTEGER NULL,
    `sqd3` INTEGER NULL,
    `sqd4` INTEGER NULL,
    `sqd5` INTEGER NULL,
    `sqd6` INTEGER NULL,
    `sqd7` INTEGER NULL,
    `sqd8` INTEGER NULL,
    `suggestions` TEXT NULL,
    `emailAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clientsatisfactionsurvey_ticketId_key`(`ticketId`),
    INDEX `clientsatisfactionsurvey_ticketId_idx`(`ticketId`),
    INDEX `clientsatisfactionsurvey_userId_idx`(`userId`),
    INDEX `clientsatisfactionsurvey_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `userskill` ADD CONSTRAINT `userskill_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `misticket` ADD CONSTRAINT `misticket_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itsticket` ADD CONSTRAINT `itsticket_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticketassignment` ADD CONSTRAINT `ticketassignment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticketassignment` ADD CONSTRAINT `ticketassignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticketnote` ADD CONSTRAINT `ticketnote_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticketnote` ADD CONSTRAINT `ticketnote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketAttachment` ADD CONSTRAINT `TicketAttachment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticketstatushistory` ADD CONSTRAINT `ticketstatushistory_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticketstatushistory` ADD CONSTRAINT `ticketstatushistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `knowledgearticle` ADD CONSTRAINT `knowledgearticle_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatsession` ADD CONSTRAINT `chatsession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatsession` ADD CONSTRAINT `chatsession_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatmessage` ADD CONSTRAINT `chatmessage_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `chatsession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `troubleshootingsolution` ADD CONSTRAINT `troubleshootingsolution_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `troubleshootingsolution` ADD CONSTRAINT `troubleshootingsolution_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientsatisfactionsurvey` ADD CONSTRAINT `clientsatisfactionsurvey_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientsatisfactionsurvey` ADD CONSTRAINT `clientsatisfactionsurvey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
