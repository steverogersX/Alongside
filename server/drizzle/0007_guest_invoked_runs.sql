ALTER TABLE "agent_runs" ALTER COLUMN "invoked_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD COLUMN "invoked_by_link_id" uuid;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD COLUMN "invoked_by_visitor_id" text;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD COLUMN "invoked_by_name" text;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_invoked_by_link_id_document_links_id_fk" FOREIGN KEY ("invoked_by_link_id") REFERENCES "public"."document_links"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "runs_have_one_invoker" CHECK (("agent_runs"."invoked_by" is not null) <> ("agent_runs"."invoked_by_visitor_id" is not null));