/*
  Warnings:

  - The values [WHITE_WINS,BLACK_WINS] on the enum `GameResult` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameResult_new" AS ENUM ('WHITE_WON', 'BLACK_WON', 'DRAW');
ALTER TABLE "games" ALTER COLUMN "result" TYPE "GameResult_new" USING ("result"::text::"GameResult_new");
ALTER TYPE "GameResult" RENAME TO "GameResult_old";
ALTER TYPE "GameResult_new" RENAME TO "GameResult";
DROP TYPE "GameResult_old";
COMMIT;
