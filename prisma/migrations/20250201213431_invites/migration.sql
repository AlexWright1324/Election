/*
  Warnings:

  - You are about to drop the `CandidateInvite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "CandidateInvite_candidateID_userID_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CandidateInvite";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_CandidateUserInvites" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CandidateUserInvites_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CandidateUserInvites_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MotionSeconderRequests" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MotionSeconderRequests_A_fkey" FOREIGN KEY ("A") REFERENCES "Motion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MotionSeconderRequests_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Candidate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "electionID" INTEGER NOT NULL,
    CONSTRAINT "Candidate_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Candidate" ("description", "electionID", "id") SELECT "description", "electionID", "id" FROM "Candidate";
DROP TABLE "Candidate";
ALTER TABLE "new_Candidate" RENAME TO "Candidate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CandidateUserInvites_AB_unique" ON "_CandidateUserInvites"("A", "B");

-- CreateIndex
CREATE INDEX "_CandidateUserInvites_B_index" ON "_CandidateUserInvites"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MotionSeconderRequests_AB_unique" ON "_MotionSeconderRequests"("A", "B");

-- CreateIndex
CREATE INDEX "_MotionSeconderRequests_B_index" ON "_MotionSeconderRequests"("B");
