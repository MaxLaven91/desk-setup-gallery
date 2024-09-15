-- CreateTable
CREATE TABLE "UserVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "votesLeft" INTEGER NOT NULL DEFAULT 25
);

-- CreateIndex
CREATE UNIQUE INDEX "UserVote_ip_key" ON "UserVote"("ip");
