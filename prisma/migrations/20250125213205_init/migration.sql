-- CreateTable
CREATE TABLE "Election" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Election',
    "description" TEXT NOT NULL DEFAULT 'Sample Description',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "start" DATETIME,
    "end" DATETIME,
    "candidateStart" DATETIME,
    "candidateEnd" DATETIME,
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

-- CreateTable
CREATE TABLE "Voter" (
    "voted" BOOLEAN NOT NULL DEFAULT false,
    "userID" TEXT NOT NULL,
    "electionID" INTEGER NOT NULL,
    CONSTRAINT "Voter_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Voter_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "electionID" INTEGER NOT NULL,
    CONSTRAINT "Ballot_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "position" INTEGER NOT NULL,
    "roleID" INTEGER NOT NULL,
    "ballotID" INTEGER NOT NULL,
    "candidateID" INTEGER NOT NULL,
    CONSTRAINT "Vote_ballotID_fkey" FOREIGN KEY ("ballotID") REFERENCES "Ballot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_candidateID_fkey" FOREIGN KEY ("candidateID") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Role',
    "seatsToFill" INTEGER NOT NULL DEFAULT 1,
    "electionID" INTEGER NOT NULL,
    CONSTRAINT "Role_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL DEFAULT '',
    "electionID" INTEGER NOT NULL,
    CONSTRAINT "Candidate_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateInvite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "candidateID" INTEGER NOT NULL,
    "userID" TEXT NOT NULL,
    CONSTRAINT "CandidateInvite_candidateID_fkey" FOREIGN KEY ("candidateID") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CandidateInvite_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Motion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Motion',
    "description" TEXT NOT NULL,
    "electionID" INTEGER NOT NULL,
    "proposerID" TEXT NOT NULL,
    CONSTRAINT "Motion_electionID_fkey" FOREIGN KEY ("electionID") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Motion_proposerID_fkey" FOREIGN KEY ("proposerID") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "userID" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ElectionToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ElectionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ElectionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CandidateToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CandidateToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CandidateToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CandidateToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CandidateToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CandidateToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MotionSeconders" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MotionSeconders_A_fkey" FOREIGN KEY ("A") REFERENCES "Motion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MotionSeconders_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Voter_userID_electionID_key" ON "Voter"("userID", "electionID");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_ballotID_roleID_key" ON "Vote"("ballotID", "roleID");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateInvite_candidateID_userID_key" ON "CandidateInvite"("candidateID", "userID");

-- CreateIndex
CREATE UNIQUE INDEX "_ElectionToUser_AB_unique" ON "_ElectionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ElectionToUser_B_index" ON "_ElectionToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CandidateToUser_AB_unique" ON "_CandidateToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CandidateToUser_B_index" ON "_CandidateToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CandidateToRole_AB_unique" ON "_CandidateToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_CandidateToRole_B_index" ON "_CandidateToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MotionSeconders_AB_unique" ON "_MotionSeconders"("A", "B");

-- CreateIndex
CREATE INDEX "_MotionSeconders_B_index" ON "_MotionSeconders"("B");
