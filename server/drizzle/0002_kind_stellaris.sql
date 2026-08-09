CREATE TYPE "public"."chat_access" AS ENUM('none', 'read', 'write');--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "document_links" ADD COLUMN "chat_access" "chat_access" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "author_link_id" uuid;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "author_visitor_id" text;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_author_link_id_document_links_id_fk" FOREIGN KEY ("author_link_id") REFERENCES "public"."document_links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_has_one_author" CHECK (("chat_messages"."author_id" is not null) <> ("chat_messages"."author_visitor_id" is not null));