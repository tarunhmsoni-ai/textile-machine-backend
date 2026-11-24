CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `Contacts` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `ContactType` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Phone` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Location` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Notes` longtext CHARACTER SET utf8mb4 NOT NULL,
    `DateAdded` datetime(6) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Contacts` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `KPIs` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `PeriodStartDate` datetime(6) NOT NULL,
    `PeriodEndDate` datetime(6) NOT NULL,
    `MachinesReceived` int NOT NULL,
    `MachinesLive` int NOT NULL,
    `MachinesSold` int NOT NULL,
    `MachinesSoldByOtherBroker` int NOT NULL,
    `QueriesReceived` int NOT NULL,
    `LeadsQualified` int NOT NULL,
    `LeadsWon` int NOT NULL,
    `LeadsLost` int NOT NULL,
    `PhoneCallsMade` int NOT NULL,
    `WhatsAppMessagesSent` int NOT NULL,
    `WhatsAppBroadcastsDone` int NOT NULL,
    `EmailsSent` int NOT NULL,
    `FactoryVisits` int NOT NULL,
    `CustomersAdded` int NOT NULL,
    `MachineDealersAdded` int NOT NULL,
    `MastersAdded` int NOT NULL,
    `ReferralPartnersAdded` int NOT NULL,
    `TotalRevenue` decimal(65,30) NOT NULL,
    `AverageTransactionValue` decimal(65,30) NOT NULL,
    `CommissionsPaid` decimal(65,30) NOT NULL,
    `AverageTurnaroundDays` double NOT NULL,
    `AverageTimeToFirstContact` double NOT NULL,
    `CreatedDate` datetime(6) NOT NULL,
    `LastUpdated` datetime(6) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_KPIs` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `ReferralPartners` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `PartnerType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Phone` longtext CHARACTER SET utf8mb4 NOT NULL,
    `WhatsApp` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Location` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NOT NULL,
    `CommissionPercentage` decimal(65,30) NOT NULL,
    `CommissionType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `IsActive` tinyint(1) NOT NULL,
    `DateAdded` datetime(6) NOT NULL,
    `LastActive` datetime(6) NULL,
    `LeadsProvided` int NOT NULL,
    `DealsMatured` int NOT NULL,
    `TotalCommissionEarned` decimal(65,30) NOT NULL,
    `TotalCommissionPaid` decimal(65,30) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_ReferralPartners` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `StaffAccessIps` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `IpAddress` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Label` longtext CHARACTER SET utf8mb4 NOT NULL,
    `DateAdded` datetime(6) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_StaffAccessIps` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Users` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `FullName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Username` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `PasswordHash` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Role` longtext CHARACTER SET utf8mb4 NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Users` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Machines` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Type` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `SubType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Brand` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Model` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Year` int NOT NULL,
    `Location` longtext CHARACTER SET utf8mb4 NOT NULL,
    `AskingPrice` decimal(65,30) NOT NULL,
    `Quantity` int NOT NULL,
    `Photos` longtext CHARACTER SET utf8mb4 NOT NULL,
    `VideoUrl` longtext CHARACTER SET utf8mb4 NULL,
    `PlatePhotoUrl` longtext CHARACTER SET utf8mb4 NULL,
    `Description` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Condition` longtext CHARACTER SET utf8mb4 NOT NULL,
    `SellerName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `SellerPhone` longtext CHARACTER SET utf8mb4 NOT NULL,
    `SellerEmail` longtext CHARACTER SET utf8mb4 NOT NULL,
    `SellerWhatsApp` longtext CHARACTER SET utf8mb4 NOT NULL,
    `SpecificationsJson` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Status` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `DateLive` datetime(6) NULL,
    `DateSold` datetime(6) NULL,
    `SoldByOtherBroker` tinyint(1) NOT NULL,
    `PostedByUserId` int NULL,
    `DatePosted` datetime(6) NOT NULL,
    `LastModified` datetime(6) NOT NULL,
    `ViewCount` int NOT NULL,
    `InquiryCount` int NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Machines` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Machines_Users_PostedByUserId` FOREIGN KEY (`PostedByUserId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `Leads` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Source` longtext CHARACTER SET utf8mb4 NOT NULL,
    `SourceDetails` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Phone` longtext CHARACTER SET utf8mb4 NOT NULL,
    `WhatsApp` longtext CHARACTER SET utf8mb4 NOT NULL,
    `RequiredMachineType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `RequiredSubType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `RequiredBrand` longtext CHARACTER SET utf8mb4 NOT NULL,
    `RequiredModel` longtext CHARACTER SET utf8mb4 NOT NULL,
    `AdditionalRequirements` longtext CHARACTER SET utf8mb4 NOT NULL,
    `BudgetMin` decimal(65,30) NULL,
    `BudgetMax` decimal(65,30) NULL,
    `PreferredLocation` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Status` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `SubStatus` longtext CHARACTER SET utf8mb4 NOT NULL,
    `RequirementEntered` tinyint(1) NOT NULL,
    `DateReceived` datetime(6) NOT NULL,
    `DateQualified` datetime(6) NULL,
    `LastFollowUp` datetime(6) NULL,
    `LastModified` datetime(6) NOT NULL,
    `AssignedToUserId` int NULL,
    `MatchedMachineId` int NULL,
    `SoldMachineId` int NULL,
    `Notes` longtext CHARACTER SET utf8mb4 NOT NULL,
    `PhoneCallCount` int NOT NULL,
    `FollowUpCount` int NOT NULL,
    `ReferralPartnerId` int NULL,
    `ReferralCommissionEarned` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_Leads` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Leads_Machines_MatchedMachineId` FOREIGN KEY (`MatchedMachineId`) REFERENCES `Machines` (`Id`),
    CONSTRAINT `FK_Leads_Machines_SoldMachineId` FOREIGN KEY (`SoldMachineId`) REFERENCES `Machines` (`Id`),
    CONSTRAINT `FK_Leads_ReferralPartners_ReferralPartnerId` FOREIGN KEY (`ReferralPartnerId`) REFERENCES `ReferralPartners` (`Id`) ON DELETE SET NULL,
    CONSTRAINT `FK_Leads_Users_AssignedToUserId` FOREIGN KEY (`AssignedToUserId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `LeadActivities` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `LeadId` int NOT NULL,
    `ActivityType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Channel` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ActivityDate` datetime(6) NOT NULL,
    `CreatedByUserId` int NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_LeadActivities` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_LeadActivities_Leads_LeadId` FOREIGN KEY (`LeadId`) REFERENCES `Leads` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_LeadActivities_Users_CreatedByUserId` FOREIGN KEY (`CreatedByUserId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_Contacts_ContactType` ON `Contacts` (`ContactType`);

CREATE INDEX `IX_LeadActivities_CreatedByUserId` ON `LeadActivities` (`CreatedByUserId`);

CREATE INDEX `IX_LeadActivities_LeadId` ON `LeadActivities` (`LeadId`);

CREATE INDEX `IX_Leads_AssignedToUserId` ON `Leads` (`AssignedToUserId`);

CREATE INDEX `IX_Leads_DateReceived` ON `Leads` (`DateReceived`);

CREATE INDEX `IX_Leads_MatchedMachineId` ON `Leads` (`MatchedMachineId`);

CREATE INDEX `IX_Leads_ReferralPartnerId` ON `Leads` (`ReferralPartnerId`);

CREATE INDEX `IX_Leads_SoldMachineId` ON `Leads` (`SoldMachineId`);

CREATE INDEX `IX_Leads_Status` ON `Leads` (`Status`);

CREATE INDEX `IX_Machines_PostedByUserId` ON `Machines` (`PostedByUserId`);

CREATE INDEX `IX_Machines_Status` ON `Machines` (`Status`);

CREATE INDEX `IX_Machines_Type` ON `Machines` (`Type`);

CREATE INDEX `IX_ReferralPartners_IsActive` ON `ReferralPartners` (`IsActive`);

CREATE UNIQUE INDEX `IX_Users_Username` ON `Users` (`Username`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20261029162816_InitialCreate', '8.0.4');

COMMIT;

