# Alongside

A workspace where people and AI agents edit the same document at the same time.
Open a document, watch other people's cursors move, and type `@claude fix the
second paragraph` into the document chat — the agent joins the room, appears in
the presence bar like anyone else, and edits the document live while you watch.

This file explains how it is built and, more usefully, *why* each decision went
the way it did. Most of them were forced by something that broke.

---

## Contents

- [Running it locally](#running-it-locally)
- [The shape of the system](#the-shape-of-the-system)
- [Data model](#data-model)
- [Identity and access](#identity-and-access)
- [Real-time collaboration](#real-time-collaboration)
- [Agents](#agents)
- [MCP](#mcp)
- [Caching](#caching)
- [Deployment](#deployment)
- [Verification](#verification)
- [Known gaps](#known-gaps)

---

## Running it locally

You need Node 22+, Docker, and about two minutes.

```bash
docker compose up -d                 # Postgres 17 on :5433

cp .env.example .env.local           # web
cp server/.env.example server/.env   # api — fill in the two secrets

cd server && npm ci && npm run db:migrate && npm run dev   # :4000
npm ci && npm run dev                                      # :3020
```

The web app runs on **3020**, not 3000, so it never fights whatever else is
already bound to 3000. Postgres is published on **5433** for the same reason —
a system Postgres on 5432 is common enough that colliding with it is a matter
of when, not if.

`SESSION_SECRET` and `CREDENTIALS_KEY` must each be at least 32 characters. The
app refuses to boot otherwise: a signing key that is present but too short is
worse than one that is missing, because nothing tells you.

### Scripts

| Command | Where | What |
| --- | --- | --- |
| `npm run dev` | root | Next dev server on 3020 |
| `npm run build` | root | production build |
| `npm run dev` | `server/` | API with `tsx watch` |
| `npm run db:generate` | `server/` | write a migration from schema changes |
| `npm run db:migrate` | `server/` | apply migrations locally |
| `npm run db:studio` | `server/` | browse the database |

---

## The shape of the system

Two deployables and a database.

```
┌──────────────────────────────┐        ┌─────────────────────────────┐
│  web — Next.js 16            │        │  api — Express 5            │
│                              │        │                             │
│  React 19, Tailwind v4       │ /api   │  REST under /api            │
│  shadcn/ui, TanStack Query   │──────▶ │  Hocuspocus under /collab   │
│  Tiptap + Yjs editor         │ proxy  │  run worker (in-process)    │
│                              │        │                             │
│                              │  wss   │                             │
│                              │───────▶│                             │
└──────────────────────────────┘        └──────────────┬──────────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │  Postgres 17    │
                                              │  rows + Yjs     │
                                              └─────────────────┘
```

**Why two services rather than one Next app with route handlers.** The
collaboration server is a long-lived WebSocket process that holds documents in
memory and writes them back on a debounce. That is the opposite of what a
serverless request handler is for. Splitting them means the API can be a plain
long-running Node process, and the web app stays a normal Next deployment.

**Why the API is proxied under the web app's origin.** This one was learned the
hard way. Originally the browser talked to `api-…` directly while the app was
served from `web-…`, which made every cookie **third-party**. Chrome blocks
those by default in private windows, so a guest would open a share link, get a
valid session, and then watch every request come back 404 — the cookie existed
but was never sent. Worse, nobody could sign in at all: the server-side session
check never saw a cookie and bounced every visit back to `/login`.

None of it reproduced locally, because in development both halves are on
`localhost` and cookies ignore the port.

The fix is a rewrite in `next.config.ts` sending `/api/*` to the API. Same
origin, first-party cookies, no CORS. A `Domain=` cookie would have been the
smaller change but `zerops.app` is on the Public Suffix List, so browsers
reject it.

The rewrite target has to be known at **build** time — Next resolves rewrites
into the build manifest, so setting it only at run time leaves the proxy
pointing at localhost and every call 500s.

**The one thing still cross-origin is the WebSocket**, because a Next rewrite
cannot proxy an upgrade. So the socket authenticates with a short-lived token
instead of a cookie — see [Real-time collaboration](#real-time-collaboration).

### Layout

```
src/
  app/(app)/       signed-in pages
  app/(auth)/      sign in and sign up
  app/d/           guest view of a shared document
  app/s/[token]/   share-link redemption
  components/      doc/ home/ shell/ ui/ workspace/
  lib/             api client, queries, collab session, avatars

server/src/
  modules/
    access/        one permission service, used by HTTP and WebSocket alike
    auth/          sessions, passwords, tokens
    collab/        Hocuspocus, Yjs persistence, block editing, presence
    runs/          job queue and the agent worker
    providers/     one adapter per API shape
    mcp/           JSON-RPC endpoint for external agents
    documents/ workspaces/ chat/ links/ presence/ agents/ connections/
  shared/          route helper, errors, cache, crypto, roles
```

Each module is `routes → controller → service → repository`. Controllers parse
and respond, services hold the rules, repositories are the only thing that
touches SQL. It is more files than a small app needs, but it means a rule is
never quietly reimplemented in two places — which matters most for permissions,
where a second implementation is a security bug waiting to happen.

---

## Data model

| Table | Holds |
| --- | --- |
| `orgs` | the billing and ownership boundary |
| `users` | humans and agents alike, separated by `kind` (`human` / `bot`) |
| `workspaces` | a group of documents |
| `grants` | who has which role in which workspace |
| `documents` | title, status, JSON content, and the Yjs `state` blob |
| `document_links` | share links, storing only a hash of the token |
| `chat_messages` | per-document conversation |
| `agent_runs` | the job queue |
| `agent_connections` | MCP tokens for external agents |

**Agents are rows in `users`.** An agent has a display name, an avatar, a role
in a workspace, and it writes chat messages — every one of those is something
the users table already does. A separate `agents` table would have meant a
parallel implementation of membership and permissions, and then a permanent
risk of the two drifting. Giving an agent a seat is the same `POST
/workspaces/:id/members` call as a person.

**Roles are `viewer | editor | admin`,** ordered and compared through one
`atLeast()` helper. Every check reads the same way, and adding a role means
editing one array.

**Share links store `sha256(token)`,** never the token. A leaked database
backup then reveals nothing usable. The token is shown exactly once, at
creation, and cannot be recovered afterwards.

**Documents keep both JSON and a Yjs binary `state`.** The JSON is what
non-editing readers and the API return; the Yjs state is the collaborative
truth. This caused a real bug: reads fell back to the JSON while writes went to
an empty Yjs document, so an agent would "successfully" edit a document nobody
could see change. Now the Yjs state is authoritative and loaded on demand, with
the JSON derived from it.

---

## Identity and access

Three ways to be someone:

1. **A session cookie** — a signed JWT, `HttpOnly`, from signing in.
2. **A link cookie** — from redeeming a share link. Carries a document id, a
   role, and a stable per-visitor id so a guest keeps the same name and cursor
   colour across a reload.
3. **A collab token** — short-lived, for the WebSocket only.

Everything funnels into `accessService`, which answers one question: what role
does this request have on this document? HTTP handlers and socket upgrades both
call it, so a guest cannot reach through the socket something the REST API
would have refused.

**The auth gate runs in the browser, not on the server.** `RequireSession`
renders a skeleton until `/auth/me` answers, then either shows the app or
redirects. This is a consequence of the cookie story above: at the time it was
written the session cookie belonged to another host and server-side rendering
could never see it. Now that the API is same-origin a server gate would work
again, but the client gate is not worth undoing — it is a rendering decision,
and the API still enforces access on every single request. The gate decides
what to draw; it is not the security boundary.

**A guest never sees "Loading…".** Skeletons match the shape of what is coming,
so the page does not jump when it arrives.

---

## Real-time collaboration

Yjs CRDTs over Hocuspocus. Tiptap 3 renders them.

**Why a CRDT rather than sending patches.** Two people typing in the same
paragraph is the normal case, not the edge case, and an agent rewriting a block
while someone edits the sentence below it has to merge without a server
arbitrating. Operational transformation would need a central authority for
ordering; a CRDT does not, which also means an agent's edits and a human's
travel the same path and are indistinguishable to everyone in the room.

**Persistence is debounced** at 2s, capped at 10s. Every keystroke is an
update; writing each one is pointless when the next arrives 80ms later. The cap
means a long editing session still checkpoints.

**Presence uses Yjs awareness,** which is ephemeral by design — it vanishes
when a socket closes, so a crashed tab does not leave a ghost cursor. Agents
join awareness too, which is why you see the agent working rather than
wondering whether it heard you.

One trap worth recording: Hocuspocus initialises awareness state to `null`, and
`setLocalStateField` on `null` silently does nothing. It has to be
`setLocalState` first. The symptom is presence that works locally and never
appears in production.

**The socket carries a token, not a cookie.** The client already fetches
`/documents/:id/identity` before connecting, so that response now includes a
JWT scoped to that one document, valid for two minutes. It rides in the query
string, which is why it is short-lived — query strings end up in proxy logs and
browser history in a way cookies do not. This is what makes collaboration work
in a private window.

**Chat and runs are pushed, not polled.** The server broadcasts a bare
`{"event":"chat"}` down the same socket and the client invalidates that query.
The socket already exists and the payload says nothing sensitive, so this costs
nothing and lands in about 25ms. Polling was the first implementation and it
was both slower and more expensive.

**One socket per document, reference counted.** The editor and the chat rail
are separate components looking at the same document; without sharing they
would open two connections and each would pay its own sync.

---

## Agents

### Bring your own key

An agent is a name, a model, a provider, and an API key that the person
supplies. The key is sealed with AES-256-GCM and never leaves the server.

**Why BYOK rather than "connect your Claude account".** The original plan was
OAuth against a Claude Pro subscription. Anthropic's Consumer Terms restrict
subscription tokens to Claude Code and claude.ai, and third-party use has been
blocked server-side since April 2026. So that door is closed by policy, not by
effort. BYOK also means no shared quota, per-user cost attribution, and support
for any provider.

**The encryption key is derived, not parsed.** `sha256(CREDENTIALS_KEY)` gives
32 bytes from any input. Parsing it as hex silently truncated a secret whose
format the host chose, which produced a key that worked until it did not.

**Providers collapse into three adapters.** Anthropic and Google have their own
shapes; everything else — OpenAI, Kimi, DeepSeek, MiniMax, Mistral, anything
self-hosted — speaks the OpenAI wire format, so one adapter covers them all.
Each is roughly a hundred lines. A general SDK was considered and skipped: the
integration is small, and the failure modes are the part that matters.

**Provider logos are the agent's avatar.** A generated mascot for something
that already has an identity is noise. Custom providers, where there is no logo
to use, get a generated one.

### Runs

A run is a row in `agent_runs` claimed with `FOR UPDATE SKIP LOCKED`.

**Why a database queue and not Redis.** There is one API process. A table gives
transactional claiming, survives a restart, and is inspectable with SQL. Redis
would add a component to operate for a guarantee Postgres already provides. The
same reasoning applies to caching — see below.

**One run per document at a time.** Three people asking the same agent at once
would have it racing itself, and each edit invalidates the anchors the others
resolved against.

**The agent answers before it works.** On pickup it posts `@you On it — I'll
make the change and tell you when it's done`, and mentions you again when it
finishes. A silent agent is indistinguishable from a broken one, and the gap
is where people give up and reload.

**Its ceiling is the lower of its own role and yours.** An editor agent invoked
by a viewer can only read. Authority is never borrowed upward.

**Editing works on blocks, not offsets.** Tools are `read_document`,
`replace_block`, `delete_block`, `insert_block`, `replace_text`,
`insert_after`, `finish`. Blocks are addressed by index and each write carries
an `expect` string — the first ~40 characters of the block it means to change.
If someone edited that block first the index still resolves but the text does
not match, and the write is refused rather than applied to the wrong paragraph.
This is what makes "delete the second paragraph on the first page" safe.

**Rate limits back off.** 429s retry with full-jitter exponential backoff,
deadline-aware so it gives up rather than exceeding the run timeout. Gemini's
`retryDelay` hint is parsed when present. Error messages are capped at 180
characters, because a provider's HTML error page rendered into a chat bubble
helps nobody.

---

## MCP

`POST /api/mcp` speaks JSON-RPC 2.0, protocol `2025-06-18`, authenticated by a
bearer token from a connection. It exposes `list_documents`, `list_mentions`,
`read_document`, `replace_text`, `insert_after`, `post_message`, and
`complete_run`.

This is the other direction: instead of Alongside calling a model, an external
agent — Claude Code on someone's laptop, say — connects and works inside a
workspace. The same `accessService` bounds what it can reach, capped by both
the agent's seat and the invoking human's own access.

---

## Caching

A small in-process TTL + LRU cache, 15 second lifetime, in front of role
lookups and workspace agent lists. Measured effect: 2.1 database round trips
per request down to 0.6.

**Why not Redis.** It was considered twice and declined twice. With one server
an in-process map is strictly faster — no serialisation, no network hop — and
the cache is pure derived data, so a restart costs one repopulation. Redis
becomes correct the moment there are two API instances, and that is the signal
to add it.

**Correctness comes from explicit invalidation, not a short TTL.** Removing
someone from a workspace calls `forgetAccess()` immediately. Waiting 15 seconds
for revoked access to expire is not an acceptable security posture, and a TTL
alone would mean exactly that.

---

## Deployment

Hosted on [Zerops](https://zerops.io): `api`, `web`, and a managed Postgres,
described in `zerops.yaml`.

**Migrations run before the process starts,** as `initCommands`, so a deploy
that changes the schema can never serve traffic against the old one. Note that
`drizzle-kit migrate` cannot be used in production — its config imports from
`src/`, which is not deployed — hence the compiled `dist/db/migrate.js`.

**Cross-service references such as `${web_zeropsSubdomain}` are not
substituted** in the places you would expect, and arrive as literal text. URLs
are spelled out instead, and `corsOrigins` filters out anything still
containing `${` so a failed substitution cannot become an allowed origin that
silently rejects every request.

**`.next` is not cached between builds.** A restored `.next/cache` recreates
`.next` with ownership the build user cannot write, and the build dies opening
`.next/trace`. This failed every web deploy for a day, and the visible symptom
was something else entirely: the site kept serving an old build, so features
that had shipped appeared broken. `node_modules` is still cached.

**Readiness checks `/login`, not `/`,** because `/` redirects when there is no
session and a readiness probe reads a redirect as unhealthy.

### CI

`.github/workflows/ci.yml`. Every pull request and push runs typegen,
typecheck, lint, and both builds. Pull requests never touch credentials, so a
branch cannot deploy by being pushed.

**Deploying is manual.** `zcli push --setup web|api` from a workstation, one
service at a time, so a change to one half does not spend ten minutes
rebuilding the other. Setting the repository variable `ZEROPS_AUTO_DEPLOY` to
`true` hands it back to CI.

A note for whoever hits it next: `zcli service deploy` uploads files as-is and
skips the build pipeline entirely. `zcli push` is the one that runs
`zerops.yaml`.

---

## Verification

Every feature is checked against the deployed stack rather than a local mock,
through the web origin, exactly as a browser reaches it: auth, workspaces,
documents, presence, chat, share links, membership, BYOK agents, runs, MCP,
collaboration, and the web app itself — including negative cases like a viewer
guest attempting a write, a revoked link, a revoked MCP token, a forged collab
token, and cross-org access.

Collaboration is verified with three real clients against production: an edit
from one editor reaching another and reaching a read-only viewer, cursors
propagating, a viewer's write never escaping their own tab, chat arriving over
the socket rather than by polling, and an edit surviving every client
disconnecting.

The most valuable thing this caught was not a failing assertion. It was that
several checks passed against a *stale deployment*, which is what exposed the
`.next` cache failure and, through it, the third-party cookie problem.

---

## Known gaps

**Giving an agent a seat has no UI.** An agent only works once it holds a
workspace membership, which today is a `POST /workspaces/:id/members` call. The
backend path is verified — a seatless agent is correctly refused, a seated one
runs — but there is no screen for it, so `@claude` cannot be set up by
clicking.

**No invite flow.** Signing up always creates a new org and there is no way to
add a second human to it, so human collaboration goes through share links only.

**A run has never been exercised with a valid provider key** in production —
only the invalid-key path, which fails cleanly and reports a short error.

**Session cookies are still `SameSite=None`.** Correct when the API was a
separate origin; now that it is proxied, `Lax` would be tighter. Harmless as it
stands, worth changing.

**One API process.** The in-process cache and the run worker both assume it. A
second instance needs Redis for the first and a leader election or advisory
lock for the second.
