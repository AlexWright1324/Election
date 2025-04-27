/*
  Warnings:

  - You are about to drop the column `published` on the `Election` table. All the data in the column will be lost.
  - You are about to drop the column `results` on the `Election` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[signature]` on the table `Ballot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Candidate_roleID_isRON_key";

-- AlterTable
ALTER TABLE "Motion" ADD COLUMN "result" JSONB;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "result" JSONB;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Election" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'New Election',
    "description" TEXT NOT NULL DEFAULT 'Sample Description',
    "imageVersion" INTEGER NOT NULL DEFAULT 0,
    "resultsPosted" BOOLEAN NOT NULL DEFAULT false,
    "nominationsStart" DATETIME,
    "nominationsEnd" DATETIME,
    "start" DATETIME,
    "end" DATETIME,
    "membersOnly" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT NOT NULL DEFAULT '',
    "ronEnabled" BOOLEAN NOT NULL DEFAULT true,
    "candidateDefaultDescription" TEXT NOT NULL DEFAULT '',
    "candidateMaxDescription" INTEGER NOT NULL DEFAULT 1000,
    "candidateMaxUsers" INTEGER NOT NULL DEFAULT 1,
    "motionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "motionDefaultDescription" TEXT NOT NULL DEFAULT '# The Society notes:
# The Society believes:
# The Society resolves to:
',
    "motionMaxDescription" INTEGER NOT NULL DEFAULT 1000,
    "motionMaxSeconders" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Election" ("apiKey", "candidateDefaultDescription", "candidateMaxDescription", "candidateMaxUsers", "description", "end", "id", "imageVersion", "membersOnly", "motionDefaultDescription", "motionEnabled", "motionMaxDescription", "motionMaxSeconders", "name", "nominationsEnd", "nominationsStart", "ronEnabled", "start") SELECT "apiKey", "candidateDefaultDescription", "candidateMaxDescription", "candidateMaxUsers", "description", "end", "id", "imageVersion", "membersOnly", "motionDefaultDescription", "motionEnabled", "motionMaxDescription", "motionMaxSeconders", "name", "nominationsEnd", "nominationsStart", "ronEnabled", "start" FROM "Election";
DROP TABLE "Election";
ALTER TABLE "new_Election" RENAME TO "Election";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_signature_key" ON "Ballot"("signature");
