# Alongside — architecture and the reasoning behind it

Alongside is a multi-workspace collaborative editor where people and AI agents
work in the same documents at the same time. This document records **why** the
system is shaped the way it is, including the alternatives we rejected and what
we deliberately have not built yet.

---

## 1. Identity: agents are users, not a separate concept

`users` has a `kind` column — `human` or `bot` — and both live in the same table
under the same `org_id`.

**Why.** The first instinct is a separate `agents` table, because an agent has a
model and no password. But look at what an agent actually does: it holds a role
in a workspace, it authors documents and chat messages, it appears in a member
list, it needs permissions checked on every action. Every one of those is a
foreign key to `users`. A separate table means every one of them becomes a
nullable pair of columns — `author_user_id` *or* `author_agent_id` — and every
join doubles. The moment you write `COALESCE(user_name, agent_name)` in a query,
the model is wrong.

Making them one table means **authorization is written once**. A permission check
doesn't ask "is this a person or a bot", it asks "what role does this actor
hold". Rendering differs — agents get violet, a monospace model name, a square
avatar — but that is a presentation concern, and presentation is the right place
for it.

The columns that only apply to one kind (`email`, `password_hash` for humans;
`model` for bots) are nullable. That is the honest trade: a few nullable columns
against duplicated joins everywhere.

### An agent's power is capped by whoever invoked it

`resolveCeiling(agentId, invoker, documentId)` returns `lower(agentRole, invokerRole)`.

**Why.** An agent with editor rights invoked by a viewer must not write. Without
this rule, an agent becomes a privilege-escalation device: anyone who can talk to
it inherits its access. The ceiling makes an agent a *tool held by a person*
rather than an independent actor — it can never do something on your behalf that
you could not do yourself.

---

## 2. Access: grants, and why membership still means something

`grants` binds `(user, role)` to **either** a workspace **or** a document.
Roles are `viewer | editor | admin`.

Document access resolves in that order: an explicit document grant wins;
otherwise the workspace grant is inherited.

**Why two levels.** Workspace-level alone can't express "this one contract is
visible to the whole team but only legal can edit it". Document-level alone means
re-granting every person on every new document. Inheritance with an override is
the smallest model that covers both.

> **A partial unique index needs its predicate repeated on upsert.** The
> uniqueness constraint on grants is partial (`where workspace_id is not null`),
> and Postgres cannot infer which index an `ON CONFLICT` targets without being
> told the same predicate — it fails with `42P10`. The fix is
> `targetWhere: sql\`${grants.workspaceId} is not null\``. This silently broke
> workspace creation entirely; it is recorded here because the error message
> points nowhere near the cause.

### So what is membership *for*, if any link can open a document?

Membership is **durable identity**; a link is **transient access**.

| | Member | Link visitor |
|---|---|---|
| Identity | account, stable across documents | per-redemption `visitorId` |
| Scope | every document their grant covers | exactly one document |
| Survives revocation | yes | no — access dies instantly |
| Discoverable | appears in people lists, can be granted more | invisible outside that document |

A link answers "let this person read this one thing". Membership answers "this
person is part of the team". Conflating them is how sharing models rot.

---

## 3. Link sharing: the bearer model

A link is a bearer credential: **whoever holds it has the access it encodes.**

We explored per-recipient links (email-bound, so only `lawyer@corp.com` can
open it). That requires either an account — which defeats "no sign-up" — or an
email round-trip on every open, which is a different product. The decision was
to build the bearer model well and leave identity-bound sharing for later.

### Storage

```
document_links
  token_hash    unique   — SHA-256, never the token itself
  role                   — viewer | editor, CHECK excludes admin
  chat_access            — none | read | write
  expires_at, revoked_at
```

**Why hash the token.** The database stores a verifier, not a credential. A
leaked backup or an over-broad `SELECT` yields hashes, which open nothing.
Same reasoning as password storage; the token is shown exactly once, at creation.

**Why `admin` is excluded by a CHECK constraint.** Admin can re-share and change
grants. A link that hands out admin lets any holder mint more access, which
makes revocation meaningless. This is enforced in the database rather than in a
service, because it is an invariant of the data — not a policy that a future code
path should be able to opt out of.

### Redemption issues a per-visitor identity

`POST /links/:token/redeem` verifies the token, then sets an httpOnly cookie
containing a JWT: `{ linkId, documentId, role, visitorId: randomUUID() }`.

**Why a fresh `visitorId` per redemption.** Originally guests were keyed by
`link:<linkId>`, so ten people opening the same link collapsed into a single
presence entry — everyone saw "only you". The visitor ID is what makes two
holders of the same link two distinct people. It is minted at redemption, not
derived from anything about the visitor, so it carries no fingerprint.

### Revocation is immediate, by construction

The JWT is not trusted on its own. Every request calls `linkService.resolve()`,
which **re-reads the link row** and checks `revoked_at` and `expires_at`.

**Why not trust the JWT's expiry.** A self-contained token cannot be withdrawn.
Revoking would mean waiting out the TTL or maintaining a denylist — which is a
database read anyway, so we do the honest one. Cost is one indexed lookup per
request; benefit is that clicking Revoke ends live sessions instantly, including
open WebSockets.

---

## 4. Chat access is a separate axis from document access

`chat_access` — `none | read | write` — is stored on the link and resolved
independently of the document role.

**Why.** "Can read the document" and "can see what the team says about the
document" are genuinely different questions. Outside counsel may need the
contract without the internal argument about it. Deriving chat from the document
role would make that unexpressible.

Members derive theirs (viewer → read, editor/admin → write) because a member is
already inside the trust boundary; guests use whatever the link grants. Verified:
a guest with `chat: none` still reads the document normally.

### Guests can author messages, which forced a schema change

`chat_messages.author_id` was a non-null FK to `users` — so a guest, having no
user row, **could not post at all**. Migration `0002`:

```
author_id          → nullable
author_link_id     → which link they came through
author_visitor_id  → which visitor
author_name        → their generated name, snapshotted
CHECK (author_id is not null) <> (author_visitor_id is not null)
```

**Why snapshot the name** instead of regenerating it from the seed. Guest names
are generated deterministically from `(documentId, visitorId)`. If the link is
later revoked and deleted, the seed is gone and the name would change or vanish —
rewriting history in a thread other people replied to. A message is a record of
something someone said; the attribution has to be as durable as the text.

**Why the CHECK constraint.** Exactly one author kind must be set. Without it,
a bug could write a message with both or neither, and every reader would then
need defensive branching forever. Constrain it once, at the bottom.

---

## 5. Live editing: CRDT over WebSocket, in memory

Yjs for the document state, Hocuspocus as the server, `@tiptap/extension-collaboration`
in the editor.

**Why a CRDT and not operational transformation.** OT requires a central server
that linearizes every operation and transforms against history — correct, but the
transform functions are notoriously hard to get right for rich text, and the
server becomes a bottleneck and a single point of correctness. A CRDT merges
concurrently by construction: order doesn't matter, so the server can be a dumb
relay. For a small team editing prose, the CRDT's memory overhead is irrelevant
and its simplicity is decisive.

**Why WebSocket and not polling or SSE.** Editing is bidirectional and
latency-sensitive; SSE is one-way and polling turns every keystroke into a round
trip. The socket also gives us disconnect detection for free, which is what makes
presence honest.

**Where the Y.Doc lives.** In every browser *and* on the server. Each client owns
a replica; the server keeps one so a late joiner can be handed current state
without asking a peer. The server does not interpret it — it relays updates and
merges them into its copy.

### The room-hijack hole, and the check that closes it

Authorization happens on the HTTP upgrade using `?doc=<uuid>`, but the room is
keyed by the document name the client sends **inside** the protocol. Those are
two different values, so a client could authorize for a document it may see and
then join a different room:

```ts
if (documentName !== documentId) throw new Error("Document mismatch");
```

The general lesson: when authorization and resource selection travel by different
channels, they must be reconciled explicitly.

Write access is enforced by `connectionConfig.readOnly = !atLeast(role, "editor")`
— server-side, because a client-side `editable: false` is a suggestion.

### Presence rides on awareness

Yjs awareness is ephemeral state attached to a connection. When a socket closes,
the entry disappears — **leaving is an event, not a timeout**. That is why the
presence bar updates instantly when someone closes a tab.

> `CollaborationCaret` calls `setLocalStateField("user", ...)` with *only* its own
> config, overwriting anything set separately. All presence fields — `key`,
> `name`, `color`, `avatarSeed`, `kind` — must be passed in the caret's `user`
> object or they are silently erased. This is why profiles briefly didn't render.

Two tabs from one person are deduped by `user.key`, so a person appears once.

There is also a TTL-based presence store (30s) for clients that are *reading* over
HTTP without a socket. Awareness is authoritative when a socket exists.

### Nothing is persisted — on purpose

There is no `onStoreDocument`, no `document_updates` table, no state column. A
server restart loses in-flight edits. This was an explicit instruction ("all in
memory for now") and is the single largest known gap.

**Where persistence would go**, when it's time:

1. `onStoreDocument` debounced (~2s) writes the Y.Doc state vector to Postgres.
2. Redis pub/sub between server instances, so two clients on different processes
   see each other — a single process needs neither.
3. Redis as the write buffer: batch N seconds of updates into one row rather than
   one write per keystroke.

On the "500 concurrent writers" question: the write amplification is not per
user, it is per *document* per flush interval. 500 people in one document is one
merged state and one periodic write, not 500 writes. The scaling limit is socket
fan-out (every update to every peer), not database throughput — which is why the
working caps are ~1k connections and ~20 concurrent writers per document, with
everyone else read-only.

---

## 6. API conventions and why they are rigid

### One envelope, everywhere

```jsonc
{ "success": true,  "data": {}, "meta": {} }
{ "success": false, "error": { "code", "message", "details" } }
```

**Why.** The client writes error handling once. A `code` is for programs, a
`message` is for people; keeping both means the UI never has to parse prose.

### Request schemas are bound to handlers, not called inside them

```ts
route({ params, body, query }, handler)
```

**Why not `schema.parse(req.body)` at the top of each handler.** Because it is
optional. Someone forgets it, and an unvalidated field flows into a query. Here
the parse happens in the wrapper and **the handler's types are derived from the
schemas**, so an unvalidated read cannot compile. Validation stops being
discipline and becomes a property of the type system.

`publicRoute()` is the same thing with `user: User | null` — endpoints reachable
by link visitors declare that in their signature.

### Errors are opaque by default

Uncaught errors log with a `randomUUID()` correlation id and return a generic
message plus that id.

**Why always, not just in production.** An earlier version returned
`error.message` in development, which put a raw SQL query in the browser. Dev
behaviour that differs from prod is exactly where disclosure bugs hide. The id
gives support a way to find the real error in logs without exposing anything.

> **Login must not use the signup password schema.** Signup enforces a minimum
> length; applying it at login turns a short wrong password into a 400 about
> length instead of a 401 — telling an attacker their guess didn't even reach the
> comparison. Login validates only "present and sane" (`min(1).max(200)`).

### Auth

JWT via `jose` (HS256), httpOnly cookie set by the server, claims `sub` + `sid`.

**Why a cookie and not `localStorage`.** An httpOnly cookie is unreadable by
injected script, and it is sent automatically on the WebSocket upgrade — which is
what lets collaboration authenticate with no token plumbing on the client.

**Why `sid`.** The session id makes tokens revocable: sign out invalidates a
session row and every token carrying that `sid` dies with it.

---

## 7. Frontend decisions

**`/s/[token]` is a route handler, not a page.** It redeems server-side, forwards
the `Set-Cookie`, and 307s to `/d/<documentId>`. As a page it shipped a client
bundle that could be stale and left visitors staring at a spinner after a
successful 200. A route handler ships **zero client JavaScript**, so there is
nothing to be stale.

**TanStack Query owns all server state.** Components never call `fetch`. Cache
keys are centralized in `lib/queries.ts` so invalidation is a lookup, not a guess.

**`useSyncExternalStore` for anything outside React** — awareness, clock, theme.
Subscribing in `useEffect` and calling `setState` triggers
`react-hooks/set-state-in-effect` and produces hydration mismatches;
`useSyncExternalStore` is the sanctioned bridge and gives correct SSR values.
Snapshots are cached in a `WeakMap` because it compares by reference.

---

## 8. Design decisions

- **Tinted canvas, white floating panels.** Panels read as objects on a surface.
  The inverse — white page, tinted panels — makes the panels look like holes.
- **Violet is reserved for agents.** Nothing else uses it, which is why an agent's
  presence is legible at a glance. The focus ring was deliberately changed to a
  neutral so it never competes.
- **Green means done, amber means in motion.** `final` documents and success
  confirmations are green; `in review` is amber with the only pulsing dot in the
  UI, because it is the only status that means "ongoing".
- **Avatars carry meaning.** People get DiceBear `notionists` (hand-drawn,
  circular); agents get `botttsNeutral` (square, violet-ringed); workspaces get
  `boring-avatars` marble. Shape alone tells you what kind of thing you're
  looking at.
- **Never the word "Loading…".** Skeletons that mirror the real layout, or a
  spinner inside a button whose label doesn't move.
- **Empty states say what to do next**, not merely that something is absent.

---

## 9. What is not built

Named honestly, because a gap you know about is a decision and a gap you don't is
a bug:

| Gap | Consequence |
|---|---|
| No document persistence | a server restart loses edits (deliberate, for now) |
| Chat is not realtime | you see others' messages only after your next fetch |
| Agent runs never execute | `POST /runs` writes a row; no worker consumes it |
| Reactions are UI-only | local state; nothing stored, nobody else sees them |
| Dead nav routes | `/workspaces`, `/people`, `/inbox`, `/settings` 404 |
| No Redis | single-process only; two instances would not see each other |

The natural next step is chat over the existing collaboration socket — the
connection is already open, already authenticated, and already knows which
document you are in.
