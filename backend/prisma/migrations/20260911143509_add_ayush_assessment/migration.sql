-- CreateTable
CREATE TABLE `AyushAssessment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visitId` INTEGER NOT NULL,
    `prakriti` VARCHAR(191) NULL,
    `vikriti` VARCHAR(191) NULL,
    `pulse` VARCHAR(191) NULL,
    `tongue` VARCHAR(191) NULL,
    `appearance` VARCHAR(191) NULL,
    `appetite` VARCHAR(191) NULL,
    `sleep` VARCHAR(191) NULL,
    `bowel` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AyushAssessment_visitId_key`(`visitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AyushAssessment` ADD CONSTRAINT `AyushAssessment_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `Visit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
