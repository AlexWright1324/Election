/*
  Warnings:

  - The primary key for the `Candidate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Election` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `candidateEnd` on the `Election` table. All the data in the column will be lost.
  - You are about to drop the column `candidateStart` on the `Election` table. All the data in the column will be lost.
  - You are about to drop the column `voted` on the `Voter` table. All the data in the column will be lost.
  - The required column `signature` was added to the `Ballot` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ballot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "signature" TEXT NOT NULL,
    "electionID" TEXT NOT NULL,
    CONSTRAINT "Ballot_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ballot" ("electionID", "id") SELECT "electionID", "id" FROM "Ballot";
DROP TABLE "Ballot";
ALTER TABLE "new_Ballot" RENAME TO "Ballot";
CREATE TABLE "new_Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "electionID" TEXT NOT NULL,
    CONSTRAINT "Candidate_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Candidate" ("description", "electionID", "id") SELECT "description", "electionID", "id" FROM "Candidate";
DROP TABLE "Candidate";
ALTER TABLE "new_Candidate" RENAME TO "Candidate";
CREATE TABLE "new_Election" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'New Election',
    "description" TEXT NOT NULL DEFAULT '# Welcome to my election!
> Please read the rules and guidelines below before proceeding.
',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "start" DATETIME,
    "end" DATETIME,
    "signUpEnd" DATETIME,
    "membersOnly" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT NOT NULL DEFAULT '',
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
    "resultsPublished" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Election" ("apiKey", "candidateDefaultDescription", "candidateMaxDescription", "candidateMaxUsers", "description", "end", "id", "membersOnly", "motionDefaultDescription", "motionEnabled", "motionMaxDescription", "motionMaxSeconders", "name", "published", "resultsPublished", "start") SELECT "apiKey", "candidateDefaultDescription", "candidateMaxDescription", "candidateMaxUsers", "description", "end", "id", "membersOnly", "motionDefaultDescription", "motionEnabled", "motionMaxDescription", "motionMaxSeconders", "name", "published", "resultsPublished", "start" FROM "Election";
DROP TABLE "Election";
ALTER TABLE "new_Election" RENAME TO "Election";
CREATE TABLE "new_Motion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Motion',
    "description" TEXT NOT NULL,
    "electionID" TEXT NOT NULL,
    "proposerID" TEXT NOT NULL,
    CONSTRAINT "Motion_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Motion_proposerID_fkey" FOREIGN KEY ("proposerID") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Motion" ("description", "electionID", "id", "name", "proposerID") SELECT "description", "electionID", "id", "name", "proposerID" FROM "Motion";
DROP TABLE "Motion";
ALTER TABLE "new_Motion" RENAME TO "Motion";
CREATE TABLE "new_Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Role',
    "seatsToFill" INTEGER NOT NULL DEFAULT 1,
    "electionID" TEXT NOT NULL,
    CONSTRAINT "Role_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Role" ("electionID", "id", "name", "seatsToFill") SELECT "electionID", "id", "name", "seatsToFill" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE TABLE "new_Vote" (
    "position" INTEGER NOT NULL,
    "roleID" INTEGER NOT NULL,
    "ballotID" INTEGER NOT NULL,
    "candidateID" TEXT NOT NULL,
    CONSTRAINT "Vote_ballotID_fkey" FOREIGN KEY ("ballotID") REFERENCES "Ballot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_candidateID_fkey" FOREIGN KEY ("candidateID") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("ballotID", "candidateID", "position", "roleID") SELECT "ballotID", "candidateID", "position", "roleID" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE UNIQUE INDEX "Vote_ballotID_roleID_key" ON "Vote"("ballotID", "roleID");
CREATE TABLE "new_Voter" (
    "userID" TEXT NOT NULL,
    "electionID" TEXT NOT NULL,
    CONSTRAINT "Voter_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Voter_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Voter" ("electionID", "userID") SELECT "electionID", "userID" FROM "Voter";
DROP TABLE "Voter";
ALTER TABLE "new_Voter" RENAME TO "Voter";
CREATE UNIQUE INDEX "Voter_userID_electionID_key" ON "Voter"("userID", "electionID");
CREATE TABLE "new__CandidateToRole" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CandidateToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CandidateToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__CandidateToRole" ("A", "B") SELECT "A", "B" FROM "_CandidateToRole";
DROP TABLE "_CandidateToRole";
ALTER TABLE "new__CandidateToRole" RENAME TO "_CandidateToRole";
CREATE UNIQUE INDEX "_CandidateToRole_AB_unique" ON "_CandidateToRole"("A", "B");
CREATE INDEX "_CandidateToRole_B_index" ON "_CandidateToRole"("B");
CREATE TABLE "new__CandidateToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CandidateToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CandidateToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__CandidateToUser" ("A", "B") SELECT "A", "B" FROM "_CandidateToUser";
DROP TABLE "_CandidateToUser";
ALTER TABLE "new__CandidateToUser" RENAME TO "_CandidateToUser";
CREATE UNIQUE INDEX "_CandidateToUser_AB_unique" ON "_CandidateToUser"("A", "B");
CREATE INDEX "_CandidateToUser_B_index" ON "_CandidateToUser"("B");
CREATE TABLE "new__CandidateUserInvites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CandidateUserInvites_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CandidateUserInvites_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__CandidateUserInvites" ("A", "B") SELECT "A", "B" FROM "_CandidateUserInvites";
DROP TABLE "_CandidateUserInvites";
ALTER TABLE "new__CandidateUserInvites" RENAME TO "_CandidateUserInvites";
CREATE UNIQUE INDEX "_CandidateUserInvites_AB_unique" ON "_CandidateUserInvites"("A", "B");
CREATE INDEX "_CandidateUserInvites_B_index" ON "_CandidateUserInvites"("B");
CREATE TABLE "new__ElectionMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ElectionMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ElectionMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__ElectionMembers" ("A", "B") SELECT "A", "B" FROM "_ElectionMembers";
DROP TABLE "_ElectionMembers";
ALTER TABLE "new__ElectionMembers" RENAME TO "_ElectionMembers";
CREATE UNIQUE INDEX "_ElectionMembers_AB_unique" ON "_ElectionMembers"("A", "B");
CREATE INDEX "_ElectionMembers_B_index" ON "_ElectionMembers"("B");
CREATE TABLE "new__ElectionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ElectionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ElectionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__ElectionToUser" ("A", "B") SELECT "A", "B" FROM "_ElectionToUser";
DROP TABLE "_ElectionToUser";
ALTER TABLE "new__ElectionToUser" RENAME TO "_ElectionToUser";
CREATE UNIQUE INDEX "_ElectionToUser_AB_unique" ON "_ElectionToUser"("A", "B");
CREATE INDEX "_ElectionToUser_B_index" ON "_ElectionToUser"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
