-- Performance indexes for frequently queried fields
-- These indexes will dramatically improve query performance

-- Articles indexes
CREATE INDEX IF NOT EXISTS "idx_articles_slug" ON "articles" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "idx_articles_status" ON "articles" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_articles_published_at" ON "articles" USING btree ("published_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_articles_status_published_at" ON "articles" USING btree ("status", "published_at" DESC);

-- Projects indexes
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_projects_featured" ON "projects" USING btree ("featured");
CREATE INDEX IF NOT EXISTS "idx_projects_status_featured" ON "projects" USING btree ("status", "featured");

-- Reading list indexes
CREATE INDEX IF NOT EXISTS "idx_reading_list_status" ON "reading_list" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_reading_list_created_at" ON "reading_list" USING btree ("created_at" DESC);

-- Work experiences indexes (for sorting by start_date)
CREATE INDEX IF NOT EXISTS "idx_work_experiences_start_date" ON "work_experiences" USING btree ("start_date" DESC);

