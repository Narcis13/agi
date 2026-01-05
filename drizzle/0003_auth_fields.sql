-- Add authentication fields
ALTER TABLE "users" ADD COLUMN "password_hash" text;
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;

-- Remove test fields
ALTER TABLE "users" DROP COLUMN IF EXISTS "test_field";
ALTER TABLE "users" DROP COLUMN IF EXISTS "another_test_field";
ALTER TABLE "users" DROP COLUMN IF EXISTS "yet_another_test_field";
