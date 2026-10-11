/* ============================================================
   MachineProjectDB — manual schema + stored procedures
   Generated from the actual EF Core model (dotnet ef migrations
   script) on 2026-10-01, then hand-organized and extended with
   stored procedures for manual DB administration.

   This app's code (Program.cs) uses EF Core migrations/EnsureCreated
   and does NOT call any stored procedures anywhere — everything
   below the "SEED DATA" section is new, written for your manual
   SSMS workflow, not something the app already relies on.
   Safe to run top-to-bottom on a fresh SQL Server instance.
   ============================================================ */

IF DB_ID('MachineProjectDB') IS NULL
BEGIN
    CREATE DATABASE MachineProjectDB;
END;
GO

USE MachineProjectDB;
GO

/* ============================================================
   TABLES (in FK dependency order)
   ============================================================ */

IF OBJECT_ID('dbo.Users', 'U') IS NULL
CREATE TABLE dbo.Users (
    Id            INT IDENTITY(1,1) NOT NULL,
    FullName      NVARCHAR(MAX)   NOT NULL,
    Username      NVARCHAR(450)   NOT NULL,
    PasswordHash  NVARCHAR(MAX)   NOT NULL,
    CreatedAt     DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2       NULL,
    IsActive      BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_Users PRIMARY KEY (Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_Username')
CREATE UNIQUE INDEX IX_Users_Username ON dbo.Users (Username);
GO

IF OBJECT_ID('dbo.ReferralPartners', 'U') IS NULL
CREATE TABLE dbo.ReferralPartners (
    Id                      INT IDENTITY(1,1) NOT NULL,
    Name                    NVARCHAR(MAX)   NOT NULL,
    PartnerType             NVARCHAR(MAX)   NOT NULL,
    Email                   NVARCHAR(MAX)   NOT NULL,
    Phone                   NVARCHAR(MAX)   NOT NULL,
    WhatsApp                NVARCHAR(MAX)   NOT NULL,
    Location                NVARCHAR(MAX)   NOT NULL,
    Description             NVARCHAR(MAX)   NOT NULL,
    CommissionPercentage    DECIMAL(18,2)   NOT NULL DEFAULT 5,
    CommissionType          NVARCHAR(MAX)   NOT NULL,
    IsActive                BIT             NOT NULL DEFAULT 1,
    DateAdded               DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    LastActive              DATETIME2       NULL,
    LeadsProvided           INT             NOT NULL DEFAULT 0,
    DealsMatured            INT             NOT NULL DEFAULT 0,
    TotalCommissionEarned   DECIMAL(18,2)   NOT NULL DEFAULT 0,
    CreatedAt               DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt               DATETIME2       NULL,
    CONSTRAINT PK_ReferralPartners PRIMARY KEY (Id)
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ReferralPartners_IsActive')
CREATE INDEX IX_ReferralPartners_IsActive ON dbo.ReferralPartners (IsActive);
GO

IF OBJECT_ID('dbo.Machines', 'U') IS NULL
CREATE TABLE dbo.Machines (
    Id                  INT IDENTITY(1,1) NOT NULL,
    Type                NVARCHAR(450)   NOT NULL,
    SubType             NVARCHAR(MAX)   NOT NULL,
    Brand               NVARCHAR(MAX)   NOT NULL,
    Model               NVARCHAR(MAX)   NOT NULL,
    Year                INT             NOT NULL,
    Location            NVARCHAR(MAX)   NOT NULL,
    AskingPrice         DECIMAL(18,2)   NOT NULL DEFAULT 0,
    Quantity            INT             NOT NULL DEFAULT 1,
    Photos              NVARCHAR(MAX)   NOT NULL,      -- JSON array of photo URLs
    VideoUrl            NVARCHAR(MAX)   NULL,
    PlatePhotoUrl       NVARCHAR(MAX)   NULL,
    Description         NVARCHAR(MAX)   NOT NULL,
    Condition           NVARCHAR(MAX)   NOT NULL,
    SellerName          NVARCHAR(MAX)   NOT NULL,
    SellerPhone         NVARCHAR(MAX)   NOT NULL,
    SellerEmail         NVARCHAR(MAX)   NOT NULL,
    SellerWhatsApp      NVARCHAR(MAX)   NOT NULL,
    SpecificationsJson  NVARCHAR(MAX)   NOT NULL DEFAULT '{}',
    Status              NVARCHAR(450)   NOT NULL DEFAULT 'Draft',  -- Draft, Verified, Live, Sold, Archived
    DateLive            DATETIME2       NULL,
    DateSold            DATETIME2       NULL,
    PostedByUserId      INT             NULL,
    DatePosted          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    LastModified        DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ViewCount           INT             NOT NULL DEFAULT 0,
    InquiryCount        INT             NOT NULL DEFAULT 0,
    CreatedAt           DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2       NULL,
    IsActive            BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_Machines PRIMARY KEY (Id),
    CONSTRAINT FK_Machines_Users_PostedByUserId FOREIGN KEY (PostedByUserId)
        REFERENCES dbo.Users (Id) ON DELETE SET NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Machines_PostedByUserId')
CREATE INDEX IX_Machines_PostedByUserId ON dbo.Machines (PostedByUserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Machines_Status')
CREATE INDEX IX_Machines_Status ON dbo.Machines (Status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Machines_Type')
CREATE INDEX IX_Machines_Type ON dbo.Machines (Type);
GO

IF OBJECT_ID('dbo.Leads', 'U') IS NULL
CREATE TABLE dbo.Leads (
    Id                          INT IDENTITY(1,1) NOT NULL,
    Source                      NVARCHAR(MAX)   NOT NULL,
    SourceDetails                NVARCHAR(MAX)   NOT NULL,
    Name                        NVARCHAR(MAX)   NOT NULL,
    Email                       NVARCHAR(MAX)   NOT NULL,
    Phone                       NVARCHAR(MAX)   NOT NULL,
    WhatsApp                    NVARCHAR(MAX)   NOT NULL,
    RequiredMachineType         NVARCHAR(MAX)   NOT NULL,
    RequiredSubType             NVARCHAR(MAX)   NOT NULL,
    RequiredBrand               NVARCHAR(MAX)   NOT NULL,
    RequiredModel               NVARCHAR(MAX)   NOT NULL,
    AdditionalRequirements      NVARCHAR(MAX)   NOT NULL,
    BudgetMin                   DECIMAL(18,2)   NULL,
    BudgetMax                   DECIMAL(18,2)   NULL,
    PreferredLocation           NVARCHAR(MAX)   NOT NULL,
    Status                      NVARCHAR(450)   NOT NULL DEFAULT 'New',
    SubStatus                   NVARCHAR(MAX)   NOT NULL,
    DateReceived                DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    DateQualified                DATETIME2       NULL,
    LastFollowUp                DATETIME2       NULL,
    LastModified                DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    AssignedToUserId             INT             NULL,
    MatchedMachineId             INT             NULL,
    SoldMachineId                INT             NULL,
    Notes                       NVARCHAR(MAX)   NOT NULL,
    PhoneCallCount               INT             NOT NULL DEFAULT 0,
    FollowUpCount                INT             NOT NULL DEFAULT 0,
    ReferralPartnerId            INT             NULL,
    ReferralCommissionEarned     BIT             NOT NULL DEFAULT 0,
    CreatedAt                   DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt                   DATETIME2       NULL,
    IsActive                    BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_Leads PRIMARY KEY (Id),
    CONSTRAINT FK_Leads_Machines_MatchedMachineId FOREIGN KEY (MatchedMachineId)
        REFERENCES dbo.Machines (Id) ON DELETE SET NULL,
    CONSTRAINT FK_Leads_Machines_SoldMachineId FOREIGN KEY (SoldMachineId)
        REFERENCES dbo.Machines (Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Leads_ReferralPartners_ReferralPartnerId FOREIGN KEY (ReferralPartnerId)
        REFERENCES dbo.ReferralPartners (Id) ON DELETE SET NULL,
    CONSTRAINT FK_Leads_Users_AssignedToUserId FOREIGN KEY (AssignedToUserId)
        REFERENCES dbo.Users (Id) ON DELETE SET NULL
);
GO
/* Note: SoldMachineId's FK uses NO ACTION instead of SET NULL like the
   EF-generated script, because SQL Server rejects two cascading/SET NULL
   paths from Leads into Machines on the same table pair (MatchedMachineId
   and SoldMachineId would both try to touch Leads rows from Machines
   deletes, which SQL Server disallows as multiple cascade paths). Delete
   a Machine's dependent Lead.SoldMachineId references manually, or set
   them NULL yourself, before deleting a sold Machine row. */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Leads_AssignedToUserId')
CREATE INDEX IX_Leads_AssignedToUserId ON dbo.Leads (AssignedToUserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Leads_DateReceived')
CREATE INDEX IX_Leads_DateReceived ON dbo.Leads (DateReceived);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Leads_MatchedMachineId')
CREATE INDEX IX_Leads_MatchedMachineId ON dbo.Leads (MatchedMachineId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Leads_ReferralPartnerId')
CREATE INDEX IX_Leads_ReferralPartnerId ON dbo.Leads (ReferralPartnerId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Leads_SoldMachineId')
CREATE INDEX IX_Leads_SoldMachineId ON dbo.Leads (SoldMachineId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Leads_Status')
CREATE INDEX IX_Leads_Status ON dbo.Leads (Status);
GO

IF OBJECT_ID('dbo.LeadActivities', 'U') IS NULL
CREATE TABLE dbo.LeadActivities (
    Id              INT IDENTITY(1,1) NOT NULL,
    LeadId          INT             NOT NULL,
    ActivityType    NVARCHAR(MAX)   NOT NULL,
    Channel         NVARCHAR(MAX)   NOT NULL,
    Description     NVARCHAR(MAX)   NOT NULL,
    ActivityDate    DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedByUserId INT             NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2       NULL,
    IsActive        BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_LeadActivities PRIMARY KEY (Id),
    CONSTRAINT FK_LeadActivities_Leads_LeadId FOREIGN KEY (LeadId)
        REFERENCES dbo.Leads (Id) ON DELETE CASCADE,
    CONSTRAINT FK_LeadActivities_Users_CreatedByUserId FOREIGN KEY (CreatedByUserId)
        REFERENCES dbo.Users (Id) ON DELETE SET NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LeadActivities_CreatedByUserId')
CREATE INDEX IX_LeadActivities_CreatedByUserId ON dbo.LeadActivities (CreatedByUserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_LeadActivities_LeadId')
CREATE INDEX IX_LeadActivities_LeadId ON dbo.LeadActivities (LeadId);
GO

IF OBJECT_ID('dbo.KPIs', 'U') IS NULL
CREATE TABLE dbo.KPIs (
    Id                          INT IDENTITY(1,1) NOT NULL,
    PeriodStartDate              DATETIME2       NOT NULL,
    PeriodEndDate                DATETIME2       NOT NULL,
    MachinesReceived             INT             NOT NULL DEFAULT 0,
    MachinesLive                 INT             NOT NULL DEFAULT 0,
    MachinesSold                 INT             NOT NULL DEFAULT 0,
    MachinesSoldByOtherBroker    INT             NOT NULL DEFAULT 0,
    QueriesReceived              INT             NOT NULL DEFAULT 0,
    LeadsQualified                INT             NOT NULL DEFAULT 0,
    LeadsWon                     INT             NOT NULL DEFAULT 0,
    LeadsLost                    INT             NOT NULL DEFAULT 0,
    PhoneCallsMade                INT             NOT NULL DEFAULT 0,
    WhatsAppMessagesSent          INT             NOT NULL DEFAULT 0,
    WhatsAppBroadcastsDone        INT             NOT NULL DEFAULT 0,
    EmailsSent                   INT             NOT NULL DEFAULT 0,
    FactoryVisits                 INT             NOT NULL DEFAULT 0,
    CustomersAdded                INT             NOT NULL DEFAULT 0,
    MachineDealersAdded           INT             NOT NULL DEFAULT 0,
    MastersAdded                  INT             NOT NULL DEFAULT 0,
    ReferralPartnersAdded         INT             NOT NULL DEFAULT 0,
    TotalRevenue                 DECIMAL(18,2)   NOT NULL DEFAULT 0,
    AverageTransactionValue       DECIMAL(18,2)   NOT NULL DEFAULT 0,
    CommissionsPaid               DECIMAL(18,2)   NOT NULL DEFAULT 0,
    AverageTurnaroundDays         FLOAT           NOT NULL DEFAULT 0,
    AverageTimeToFirstContact     FLOAT           NOT NULL DEFAULT 0,
    CreatedDate                  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    LastUpdated                  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedAt                    DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt                    DATETIME2       NULL,
    IsActive                     BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_KPIs PRIMARY KEY (Id)
);
GO

/* ============================================================
   SEED DATA — default admin account (admin / admin123)
   Hash below was generated with the app's own
   Microsoft.AspNetCore.Identity.PasswordHasher<T>, so it will
   verify correctly through the existing /api/auth/login code —
   this is not a placeholder, it is a real working hash.
   ============================================================ */

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'admin')
INSERT INTO dbo.Users (FullName, Username, PasswordHash, CreatedAt, IsActive)
VALUES (
    'Administrator',
    'admin',
    'AQAAAAIAAYagAAAAEIjiB83H8XlmaKNUUMWNWdJNmdMQyqIvujDFuVjvow2SLd+Zs+GqnAlj6oKXxORyNQ==',
    SYSUTCDATETIME(),
    1
);
GO

/* ============================================================
   STORED PROCEDURES
   None of these are called by the application code today (it
   uses EF Core/LINQ, not SPs) — these are provided for your own
   manual data administration from SSMS.
   ============================================================ */

-- ---------- Users ----------

CREATE OR ALTER PROCEDURE dbo.sp_User_GetByUsername
    @Username NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, FullName, Username, CreatedAt, IsActive
    FROM dbo.Users
    WHERE Username = @Username;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_User_List
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, FullName, Username, CreatedAt, IsActive
    FROM dbo.Users
    ORDER BY CreatedAt DESC;
END;
GO

-- ---------- Machines ----------

CREATE OR ALTER PROCEDURE dbo.sp_Machine_List
    @Type NVARCHAR(450) = NULL,
    @Status NVARCHAR(450) = NULL,
    @Search NVARCHAR(200) = NULL,
    @Location NVARCHAR(200) = NULL,
    @MinPrice DECIMAL(18,2) = NULL,
    @MaxPrice DECIMAL(18,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM dbo.Machines
    WHERE IsActive = 1
      AND (@Type IS NULL OR Type = @Type)
      AND (@Status IS NULL OR Status = @Status)
      AND (@Location IS NULL OR Location LIKE '%' + @Location + '%')
      AND (@MinPrice IS NULL OR AskingPrice >= @MinPrice)
      AND (@MaxPrice IS NULL OR AskingPrice <= @MaxPrice)
      AND (@Search IS NULL
           OR Brand LIKE '%' + @Search + '%'
           OR Model LIKE '%' + @Search + '%'
           OR SubType LIKE '%' + @Search + '%')
    ORDER BY DatePosted DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Machine_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.Machines WHERE Id = @Id;

    UPDATE dbo.Machines SET ViewCount = ViewCount + 1 WHERE Id = @Id;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Machine_Insert
    @Type NVARCHAR(450),
    @SubType NVARCHAR(MAX),
    @Brand NVARCHAR(MAX),
    @Model NVARCHAR(MAX),
    @Year INT,
    @Location NVARCHAR(MAX),
    @AskingPrice DECIMAL(18,2),
    @Photos NVARCHAR(MAX),
    @Description NVARCHAR(MAX),
    @Condition NVARCHAR(MAX),
    @SellerName NVARCHAR(MAX),
    @SellerPhone NVARCHAR(MAX),
    @SellerEmail NVARCHAR(MAX),
    @SellerWhatsApp NVARCHAR(MAX),
    @PostedByUserId INT = NULL,
    @NewId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Machines (
        Type, SubType, Brand, Model, Year, Location, AskingPrice, Quantity,
        Photos, Description, Condition, SellerName, SellerPhone, SellerEmail,
        SellerWhatsApp, SpecificationsJson, Status, PostedByUserId,
        DatePosted, LastModified, CreatedAt, IsActive
    )
    VALUES (
        @Type, @SubType, @Brand, @Model, @Year, @Location, @AskingPrice, 1,
        @Photos, @Description, @Condition, @SellerName, @SellerPhone, @SellerEmail,
        @SellerWhatsApp, '{}', 'Draft', @PostedByUserId,
        SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME(), 1
    );
    SET @NewId = SCOPE_IDENTITY();
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Machine_UpdateStatus
    @Id INT,
    @Status NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Machines
    SET Status = @Status,
        LastModified = SYSUTCDATETIME(),
        DateLive = CASE WHEN @Status = 'Live' AND DateLive IS NULL THEN SYSUTCDATETIME() ELSE DateLive END,
        DateSold = CASE WHEN @Status = 'Sold' AND DateSold IS NULL THEN SYSUTCDATETIME() ELSE DateSold END
    WHERE Id = @Id;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Machine_SoftDelete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Machines SET IsActive = 0, LastModified = SYSUTCDATETIME() WHERE Id = @Id;
END;
GO

-- ---------- Leads ----------

CREATE OR ALTER PROCEDURE dbo.sp_Lead_List
    @Status NVARCHAR(450) = NULL,
    @AssignedToUserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM dbo.Leads
    WHERE IsActive = 1
      AND (@Status IS NULL OR Status = @Status)
      AND (@AssignedToUserId IS NULL OR AssignedToUserId = @AssignedToUserId)
    ORDER BY DateReceived DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Lead_Insert
    @Source NVARCHAR(MAX),
    @Name NVARCHAR(MAX),
    @Email NVARCHAR(MAX),
    @Phone NVARCHAR(MAX),
    @RequiredMachineType NVARCHAR(MAX),
    @RequiredBrand NVARCHAR(MAX),
    @BudgetMin DECIMAL(18,2) = NULL,
    @BudgetMax DECIMAL(18,2) = NULL,
    @NewId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Leads (
        Source, SourceDetails, Name, Email, Phone, WhatsApp,
        RequiredMachineType, RequiredSubType, RequiredBrand, RequiredModel,
        AdditionalRequirements, BudgetMin, BudgetMax, PreferredLocation,
        Status, SubStatus, DateReceived, LastModified, Notes,
        CreatedAt, IsActive
    )
    VALUES (
        @Source, '', @Name, @Email, @Phone, '',
        @RequiredMachineType, '', @RequiredBrand, '',
        '', @BudgetMin, @BudgetMax, '',
        'New', '', SYSUTCDATETIME(), SYSUTCDATETIME(), '',
        SYSUTCDATETIME(), 1
    );
    SET @NewId = SCOPE_IDENTITY();
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Lead_UpdateStatus
    @Id INT,
    @Status NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Leads
    SET Status = @Status,
        LastModified = SYSUTCDATETIME(),
        DateQualified = CASE WHEN @Status = 'Qualified' AND DateQualified IS NULL THEN SYSUTCDATETIME() ELSE DateQualified END
    WHERE Id = @Id;
END;
GO

-- ---------- Lead Activities ----------

CREATE OR ALTER PROCEDURE dbo.sp_LeadActivity_Insert
    @LeadId INT,
    @ActivityType NVARCHAR(MAX),
    @Channel NVARCHAR(MAX),
    @Description NVARCHAR(MAX),
    @CreatedByUserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.LeadActivities (
        LeadId, ActivityType, Channel, Description, ActivityDate,
        CreatedByUserId, CreatedAt, IsActive
    )
    VALUES (
        @LeadId, @ActivityType, @Channel, @Description, SYSUTCDATETIME(),
        @CreatedByUserId, SYSUTCDATETIME(), 1
    );

    UPDATE dbo.Leads SET LastFollowUp = SYSUTCDATETIME(), FollowUpCount = FollowUpCount + 1
    WHERE Id = @LeadId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_LeadActivity_ListByLead
    @LeadId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.LeadActivities
    WHERE LeadId = @LeadId AND IsActive = 1
    ORDER BY ActivityDate DESC;
END;
GO

-- ---------- Referral Partners ----------

CREATE OR ALTER PROCEDURE dbo.sp_ReferralPartner_List
    @ActiveOnly BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.ReferralPartners
    WHERE (@ActiveOnly = 0 OR IsActive = 1)
    ORDER BY DateAdded DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ReferralPartner_Insert
    @Name NVARCHAR(MAX),
    @PartnerType NVARCHAR(MAX),
    @Phone NVARCHAR(MAX),
    @WhatsApp NVARCHAR(MAX),
    @Location NVARCHAR(MAX),
    @CommissionPercentage DECIMAL(18,2) = 5,
    @NewId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.ReferralPartners (
        Name, PartnerType, Email, Phone, WhatsApp, Location, Description,
        CommissionPercentage, CommissionType, IsActive, DateAdded,
        LeadsProvided, DealsMatured, TotalCommissionEarned, CreatedAt
    )
    VALUES (
        @Name, @PartnerType, '', @Phone, @WhatsApp, @Location, '',
        @CommissionPercentage, 'Percentage', 1, SYSUTCDATETIME(),
        0, 0, 0, SYSUTCDATETIME()
    );
    SET @NewId = SCOPE_IDENTITY();
END;
GO

-- ---------- KPIs ----------

CREATE OR ALTER PROCEDURE dbo.sp_KPI_GetForPeriod
    @StartDate DATETIME2,
    @EndDate DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.KPIs
    WHERE PeriodStartDate >= @StartDate AND PeriodEndDate <= @EndDate
    ORDER BY PeriodStartDate DESC;
END;
GO

PRINT 'Schema, seed data, and stored procedures applied successfully.';
GO
