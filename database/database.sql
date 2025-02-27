CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "ChatMessages" (
    "Id" text NOT NULL,
    "Message" text NOT NULL,
    "AuthorId" text NOT NULL,
    "RecipientId" text NOT NULL,
    CONSTRAINT "PK_ChatMessages" PRIMARY KEY ("Id")
);

CREATE TABLE "Users" (
    "Id" text NOT NULL,
    "Username" text NOT NULL,
    "Password" text NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE TABLE "Wantlists" (
    "Id" text NOT NULL,
    "Name" text NOT NULL,
    "OwnerId" text NOT NULL,
    CONSTRAINT "PK_Wantlists" PRIMARY KEY ("Id")
);

CREATE TABLE "WantlistCards" (
    "Id" text NOT NULL,
    "WantlistId" text NOT NULL,
    "CardId" text NOT NULL,
    CONSTRAINT "PK_WantlistCards" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_WantlistCards_Wantlists_WantlistId" FOREIGN KEY ("WantlistId") REFERENCES "Wantlists" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_WantlistCards_WantlistId" ON "WantlistCards" ("WantlistId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250224195853_InitialMigration', '9.0.1');

COMMIT;


