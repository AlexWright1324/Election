#!/bin/sh
set -e

prisma="bunx prisma"

$prisma db push --force-reset --schema prisma/main.prisma
$prisma db push --force-reset --schema prisma/election.prisma
$prisma db push --force-reset --schema prisma/competition.prisma

rm store/main.db