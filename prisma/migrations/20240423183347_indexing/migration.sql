-- DropIndex
DROP INDEX "users_email_username_idx";

-- CreateIndex
CREATE INDEX "otps_id_email_idx" ON "otps"("id", "email");

-- CreateIndex
CREATE INDEX "users_email_username_id_idx" ON "users"("email", "username", "id");
