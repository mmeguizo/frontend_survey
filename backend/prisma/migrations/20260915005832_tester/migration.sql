/*
  Warnings:

  - You are about to drop the `TicketAttachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TicketAttachment` DROP FOREIGN KEY `TicketAttachment_deletedById_fkey`;

-- DropForeignKey
ALTER TABLE `TicketAttachment` DROP FOREIGN KEY `TicketAttachment_ticketId_fkey`;

-- DropForeignKey
ALTER TABLE `TicketAttachment` DROP FOREIGN KEY `TicketAttachment_uploadedById_fkey`;

-- DropTable
DROP TABLE `TicketAttachment`;

-- CreateTable
CREATE TABLE `ticketattachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `uploadedById` INTEGER NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticketattachment_ticketId_idx`(`ticketId`),
    INDEX `ticketattachment_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ticketattachment` ADD CONSTRAINT `ticketattachment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticketattachment` ADD CONSTRAINT `ticketattachment_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticketattachment` ADD CONSTRAINT `ticketattachment_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
