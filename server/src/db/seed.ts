import { db, pool } from "@/db/client.ts";
import {
  chatMessages,
  documents,
  grants,
  orgs,
  userIdentities,
  users,
  workspaces,
} from "@/db/schema/index.ts";
import { hashPassword } from "@/modules/auth/password.ts";

const paragraph = (text: string, claim?: string) => ({
  type: "paragraph",
  ...(claim ? { attrs: { claim } } : {}),
  content: [{ type: "text", text }],
});

const heading = (text: string) => ({
  type: "heading",
  attrs: { level: 2 },
  content: [{ type: "text", text }],
});

async function seed() {
  const email = "pavan@acme.com";
  const password = "alongside123";

  await db.delete(chatMessages);
  await db.delete(grants);
  await db.delete(documents);
  await db.delete(workspaces);
  await db.delete(userIdentities);
  await db.delete(users);
  await db.delete(orgs);

  const [org] = await db
    .insert(orgs)
    .values({ name: "Acme", slug: `acme-${Date.now().toString(36)}` })
    .returning();

  const [owner, sam, noor, claude, atlas] = await db
    .insert(users)
    .values([
      {
        orgId: org!.id,
        kind: "human",
        displayName: "Pavan",
        email,
        isOrgAdmin: true,
      },
      {
        orgId: org!.id,
        kind: "human",
        displayName: "Sam Ortega",
        email: "sam@acme.com",
      },
      {
        orgId: org!.id,
        kind: "human",
        displayName: "Noor Haddad",
        email: "noor@acme.com",
      },
      {
        orgId: org!.id,
        kind: "bot",
        displayName: "Claude",
        model: "Opus 5",
      },
      {
        orgId: org!.id,
        kind: "bot",
        displayName: "Atlas",
        model: "Sonnet 5",
      },
    ])
    .returning();

  await db.insert(userIdentities).values({
    userId: owner!.id,
    provider: "password",
    providerUserId: email,
    passwordHash: await hashPassword(password),
  });

  const [msa, research] = await db
    .insert(workspaces)
    .values([
      {
        orgId: org!.id,
        name: "Enterprise MSA",
        purpose: "Renewal terms, redlines, and the counterparty thread.",
        createdBy: owner!.id,
      },
      {
        orgId: org!.id,
        name: "Market Research",
        purpose: "Competitor teardowns and the weekly signal digest.",
        createdBy: owner!.id,
      },
    ])
    .returning();

  await db.insert(grants).values([
    { userId: owner!.id, workspaceId: msa!.id, role: "admin", grantedBy: owner!.id },
    { userId: sam!.id, workspaceId: msa!.id, role: "editor", grantedBy: owner!.id },
    { userId: noor!.id, workspaceId: msa!.id, role: "viewer", grantedBy: owner!.id },
    { userId: claude!.id, workspaceId: msa!.id, role: "editor", grantedBy: owner!.id },
    { userId: owner!.id, workspaceId: research!.id, role: "admin", grantedBy: owner!.id },
    { userId: atlas!.id, workspaceId: research!.id, role: "editor", grantedBy: owner!.id },
  ]);

  const [terms, cover] = await db
    .insert(documents)
    .values([
      {
        workspaceId: msa!.id,
        title: "MSA — renewal terms",
        status: "in_review",
        createdBy: sam!.id,
        content: {
          type: "doc",
          content: [
            heading("Where we landed"),
            paragraph(
              "We are renewing for another twelve months on substantially the same commercial terms. Three things moved: the liability cap, the notice period, and the security addendum. Everything else carries over from the 2024 agreement untouched."
            ),
            paragraph(
              "The negotiation took four weeks, most of it spent on a single number. Their procurement team opened at two times trailing fees and held there for two rounds. We have never signed above one times, and the last six deals we pulled all settled between one and one and a half."
            ),
            heading("The liability cap"),
            paragraph(
              "We are proposing one hundred and fifty percent of the fees paid in the twelve months before the claim. That is above our standard but below their opening ask, and it matches four of the six comparable agreements we reviewed.",
              "Claude"
            ),
            paragraph(
              "The carve-outs are unchanged: death or personal injury caused by negligence, fraud, and anything that cannot lawfully be limited. Keeping this paragraph verbatim from last year means neither side has to re-litigate what is already settled."
            ),
          ],
        },
      },
      {
        workspaceId: msa!.id,
        title: "Renewal cover note",
        createdBy: sam!.id,
        content: {
          type: "doc",
          content: [
            heading("Summary for legal"),
            paragraph(
              "This note covers what changed in the renewal and why, so you do not have to diff the two agreements yourself. Read this first; the redline is attached for the detail."
            ),
          ],
        },
      },
      {
        workspaceId: research!.id,
        title: "Competitor teardown — Q3",
        status: "final",
        createdBy: owner!.id,
        content: {
          type: "doc",
          content: [
            heading("What we looked at"),
            paragraph(
              "Nine products, all of which claim some version of collaborative AI. Everything here comes from public pages, published pricing, and trial accounts."
            ),
          ],
        },
      },
    ])
    .returning();

  await db.insert(chatMessages).values([
    {
      documentId: terms!.id,
      authorId: sam!.id,
      body: "Claude, pull what we've settled at on liability caps the last two years.",
    },
    {
      documentId: terms!.id,
      authorId: claude!.id,
      body: "Six agreements. Four settled at 1.5x trailing fees, one at 1x, one at 2x — the 2x was the reseller deal where we carried no implementation risk.",
    },
    {
      documentId: terms!.id,
      authorId: noor!.id,
      body: "So 1.5x is the honest middle. Draft it, but leave the carve-outs alone.",
    },
    {
      documentId: cover!.id,
      authorId: sam!.id,
      body: "Starting this once the terms doc settles.",
    },
  ]);

  console.log(`seeded org ${org!.name}`);
  console.log(`login: ${email} / ${password}`);
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    void pool.end().then(() => process.exit(1));
  });
