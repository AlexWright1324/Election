/*
  Warnings:

  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `resultsPublished` on the `Election` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Vote_ballotID_roleID_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Vote";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CandidateVote" (
    "position" INTEGER NOT NULL,
    "ballotID" INTEGER NOT NULL,
    "candidateID" TEXT NOT NULL,
    CONSTRAINT "CandidateVote_ballotID_fkey" FOREIGN KEY ("ballotID") REFERENCES "Ballot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CandidateVote_candidateID_fkey" FOREIGN KEY ("candidateID") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MotionVote" (
    "vote" TEXT NOT NULL,
    "motionID" TEXT NOT NULL,
    "ballotID" INTEGER NOT NULL,
    CONSTRAINT "MotionVote_ballotID_fkey" FOREIGN KEY ("ballotID") REFERENCES "Ballot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MotionVote_motionID_fkey" FOREIGN KEY ("motionID") REFERENCES "Motion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "imageVersion" INTEGER NOT NULL DEFAULT 0,
    "isRON" BOOLEAN NOT NULL DEFAULT false,
    "roleID" INTEGER NOT NULL,
    CONSTRAINT "Candidate_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Candidate" ("description", "id", "roleID") SELECT "description", "id", "roleID" FROM "Candidate";
DROP TABLE "Candidate";
ALTER TABLE "new_Candidate" RENAME TO "Candidate";
CREATE UNIQUE INDEX "Candidate_roleID_isRON_key" ON "Candidate"("roleID", "isRON");
CREATE TABLE "new_Election" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'New Election',
    "description" TEXT NOT NULL DEFAULT 'Sample Description',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "imageVersion" INTEGER NOT NULL DEFAULT 0,
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
    "motionMaxSeconders" INTEGER NOT NULL DEFAULT 1,
    "results" JSONB
);
INSERT INTO "new_Election" ("apiKey", "candidateDefaultDescription", "candidateMaxDescription", "candidateMaxUsers", "description", "end", "id", "membersOnly", "motionDefaultDescription", "motionEnabled", "motionMaxDescription", "motionMaxSeconders", "name", "nominationsEnd", "published", "start") SELECT "apiKey", "candidateDefaultDescription", "candidateMaxDescription", "candidateMaxUsers", "description", "end", "id", "membersOnly", "motionDefaultDescription", "motionEnabled", "motionMaxDescription", "motionMaxSeconders", "name", "nominationsEnd", "published", "start" FROM "Election";
DROP TABLE "Election";
ALTER TABLE "new_Election" RENAME TO "Election";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateVote_ballotID_candidateID_key" ON "CandidateVote"("ballotID", "candidateID");

-- CreateIndex
CREATE UNIQUE INDEX "MotionVote_ballotID_motionID_key" ON "MotionVote"("ballotID", "motionID");
