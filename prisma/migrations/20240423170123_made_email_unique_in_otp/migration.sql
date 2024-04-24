/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `otps` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "otps_email_key" ON "otps"("email");
