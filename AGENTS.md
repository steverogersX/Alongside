<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working in Alongside

Conventions for anyone — human or agent — writing code here. For *why the system
is shaped this way*, read [ARCHITECTURE.md](./ARCHITECTURE.md); this file is the
house style.

## Layout

```
src/                 Next.js app (App Router, client components + TanStack Query)
server/src/          Express API — see the module layout below
server/drizzle/      generated SQL migrations, applied in order
```

The frontend `tsconfig.json` excludes `server/` — the two halves typecheck
separately and share nothing but the wire format.

## Code style

**No prose comments.** Code should read without narration. A comment is
justified only when it records something the code cannot: a non-obvious
constraint, a subtle ordering requirement, or a `eslint-disable` with cause.
"Fetch the user" above a line that fetches the user is noise.

**Name things after what they mean to a user**, not how they are implemented.
`chatAccess` beats `chatPermissionLevel`; `visitorId` beats `anonUserToken`.

**Types are derived, never hand-mirrored.** If a shape exists in a Zod schema or
a Drizzle table, infer from it. A hand-written interface that duplicates a schema
is a bug waiting for the two to drift.

## Backend

Every module is a folder under `server/src/modules/<name>/` with the same shape:

| File | Holds |
|---|---|
| `*.routes.ts` | path → controller wiring, nothing else |
| `*.controller.ts` | schema binding + response shaping |
| `*.service.ts` | business rules and authorization |
| `*.repository.ts` | all SQL for the module |
| `*.schema.ts` | Zod request schemas |
| `*.mapper.ts` | row → public shape (strips secrets) |

Controllers never touch the database; repositories never make authorization
decisions. Anything a second module needs goes through the owning service.

**Imports use the `@/` alias with explicit `.ts` extensions** (`@/db/client.ts`).
The build is `tsup` because `tsc` alone cannot rewrite the alias.

**Every endpoint binds its request through `route()` / `publicRoute()`:**

```ts
export const thing = route(
  { params: idParams, body: createThing, query: noQuery },
  async ({ params, body, user, res }) => { /* all three are typed and parsed */ }
);
```

The handler's argument types are *derived from* the schemas you pass, so reading
a field the schema doesn't define is a compile error, and omitting a slot makes
its value `undefined` at the type level. Use `noBody` / `noQuery` rather than
leaving a slot off — being explicit about "this takes nothing" is the point.

**Every response uses the one envelope** (`shared/response.ts`):

```jsonc
{ "success": true,  "data": { }, "meta": { } }
{ "success": false, "error": { "code": "...", "message": "...", "details": { } } }
```

**Errors never leak internals.** Throw the typed helpers from `shared/errors.ts`.
Anything uncaught becomes a generic 500 with a correlation `errorId` that is also
logged server-side — the client never sees a stack trace, a query, or a driver
message. This is not a production-only behaviour; it is always on.

## Frontend

- **shadcn/ui only.** No bespoke buttons, dialogs, or inputs. If a primitive is
  missing, add it via the shadcn CLI rather than hand-rolling one.
- **Style through tokens**, never literal colors. `text-muted-foreground`, not
  `text-gray-500`. Both themes are defined by tokens; a literal breaks one.
- **Violet (`--agent`) is reserved for agents.** Never use it for focus rings,
  links, or primary actions — its whole job is "a machine did this".
- **Green (`--online`) means success or done**; amber (`--review`) means in
  motion.
- **Never render the word "Loading…".** Use `Skeleton`-based components from
  `components/skeletons.tsx`, or `Spinner` inside a button whose label stays put.
- **Every list needs three states** — loading skeleton, `EmptyState`, and
  content. An empty state says what the thing is for and what to do next; it
  does not merely report absence.
- Data goes through TanStack Query hooks in `lib/queries.ts`. Components do not
  call `fetch`.

## Running it

```bash
docker compose up -d          # Postgres on 5433 — 5432 is taken by another project
npm run dev                   # Next.js
cd server && npm run dev      # API on 4000
cd server && npx drizzle-kit generate && npx drizzle-kit migrate
```

**Do not run `next build`.** Turbopack's worker crashes on this Windows setup
(`0xc0000142`, a process-init failure unrelated to the code). Verify with
`npx tsc --noEmit` and `npx eslint src --max-warnings=0` instead — both must be
clean before you call anything done.
