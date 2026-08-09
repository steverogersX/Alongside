CREATE TABLE "agent_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"label" text NOT NULL,
	"workspace_ids" uuid[],
	"last_seen_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_connections_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpointALTER TABLE "agent_runs" ALTER COLUMN "status" SET DEFAULT 'queued';
--> statement-breakpointALTER TABLE "agent_runs" ADD COLUMN "error" text;
--> statement-breakpointALTER TABLE "agent_runs" ADD COLUMN "trigger_message_id" uuid;
--> statement-breakpointALTER TABLE "agent_runs" ADD COLUMN "connection_id" uuid;
--> statement-breakpointALTER TABLE "agent_runs" ADD COLUMN "claimed_at" timestamp with time zone;
--> statement-breakpointALTER TABLE "agent_runs" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;
--> statement-breakpointALTER TABLE "agent_connections" ADD CONSTRAINT "agent_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpointALTER TABLE "agent_connections" ADD CONSTRAINT "agent_connections_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpointCREATE INDEX "connections_user_idx" ON "agent_connections" USING btree ("user_id");
--> statement-breakpointALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_connection_id_agent_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."agent_connections"("id") ON DELETE set null ON UPDATE no action;
