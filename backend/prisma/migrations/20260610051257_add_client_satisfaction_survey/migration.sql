-- CreateTable
CREATE TABLE `ClientSatisfactionSurvey` (
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

    UNIQUE INDEX `ClientSatisfactionSurvey_ticketId_key`(`ticketId`),
    INDEX `ClientSatisfactionSurvey_ticketId_idx`(`ticketId`),
    INDEX `ClientSatisfactionSurvey_userId_idx`(`userId`),
    INDEX `ClientSatisfactionSurvey_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientSatisfactionSurvey` ADD CONSTRAINT `ClientSatisfactionSurvey_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientSatisfactionSurvey` ADD CONSTRAINT `ClientSatisfactionSurvey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
