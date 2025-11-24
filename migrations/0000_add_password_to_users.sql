CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500),
	"content" text NOT NULL,
	"excerpt" text,
	"tags" text,
	"seo_keywords" text,
	"author" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'Draft' NOT NULL,
	"views" varchar(50) DEFAULT '0' NOT NULL,
	"published_at" timestamp,
	"first_published_at" timestamp,
	"last_published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"bio" text NOT NULL,
	"location" varchar(255),
	"email" varchar(255),
	"twitter" varchar(255),
	"linkedin" varchar(255),
	"github" varchar(255),
	"website" varchar(255),
	"avatar_url" text,
	"show_twitter" boolean DEFAULT true,
	"show_linkedin" boolean DEFAULT true,
	"show_github" boolean DEFAULT true,
	"show_email" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"link" varchar(500),
	"tags" text,
	"status" varchar(50) DEFAULT 'Active' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reading_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"author" varchar(255) NOT NULL,
	"link" varchar(500),
	"description" text,
	"category" varchar(100),
	"status" varchar(50) DEFAULT 'To Read' NOT NULL,
	"rating" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seo_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_title" varchar(255) DEFAULT 'Portfolio' NOT NULL,
	"site_description" text DEFAULT 'Welcome to my portfolio' NOT NULL,
	"site_keywords" text,
	"og_title" varchar(255),
	"og_description" text,
	"og_image" text,
	"twitter_card" varchar(50) DEFAULT 'summary_large_image',
	"twitter_site" varchar(255),
	"twitter_creator" varchar(255),
	"favicon_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar(255),
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "work_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"start_date" varchar(50) NOT NULL,
	"end_date" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"logo" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");