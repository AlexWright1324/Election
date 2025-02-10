-- CreateTable
CREATE TABLE "_ElectionMembers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ElectionMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Election" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ElectionMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Election" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'New Election',
    "description" TEXT NOT NULL DEFAULT 'Sample Description',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "start" DATETIME,
    "end" DATETIME,
    "candidateStart" DATETIME,
    "candidateEnd" DATETIME,
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
INSERT INTO "new_Election" ("candidateDefaultDescription", "candidateEnd", "candidateMaxDescription", "candidateMaxUsers", "candidateStart", "description", "end", "id", "motionDefaultDescription", "motionEnabled", "motionMaxDescription", "motionMaxSeconders", "name", "published", "resultsPublished", "start") SELECT "candidateDefaultDescription", "candidateEnd", "candidateMaxDescription", "candidateMaxUsers", "candidateStart", "description", "end", "id", "motionDefaultDescription", "motionEnabled", "motionMaxDescription", "motionMaxSeconders", "name", "published", "resultsPublished", "start" FROM "Election";
DROP TABLE "Election";
ALTER TABLE "new_Election" RENAME TO "Election";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ElectionMembers_AB_unique" ON "_ElectionMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_ElectionMembers_B_index" ON "_ElectionMembers"("B");
