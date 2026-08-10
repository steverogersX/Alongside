# AI tool disclosure

This project was built with AI assistance. This file records what was used,
for what, and how the output was checked, so the claim on the submission form
can be backed by something specific.

## Tools used

| Tool | Model | Used for |
| --- | --- | --- |
| Claude Code | Claude Opus 5 | Architecture, implementation, debugging, deployment, tests, documentation |

> **To confirm before submitting:** 9 early feature commits and the initial
> `create-next-app` scaffold do not carry an AI co-author trailer, so this file
> cannot attribute them. If another assistant (Cursor, Copilot, v0, ChatGPT, or
> similar) contributed to those, add it to the table above. Everything else is
> evidenced below.

## How much

Of 168 commits:

- **146** carry `Co-Authored-By: Claude Opus 5`
- **12** are merge commits
- **1** is the `create-next-app` scaffold
- **9** are early feature commits with no trailer — see the note above

Reproduce this count with:

```bash
git log --format='%b' | grep -c 'Co-Authored-By: Claude'
```

Commit-level attribution is in the git history rather than only in this file,
so it can be audited per change instead of taken on trust.

## What the AI did

- Designed and implemented both halves: the Next.js app and the Express API
- Built the collaborative editing layer (Yjs, Hocuspocus, presence, block-level
  agent editing tools)
- Built the agent system: BYOK credential sealing, provider adapters, the run
  queue and worker, retry and backoff, the MCP endpoint
- Diagnosed and fixed the production failures described in the README —
  third-party cookies, the `.next` build cache, bodyless POSTs, share links
  resolving to localhost
- Wrote the deployment configuration and CI pipeline
- Wrote the test harness and the documentation, including this file

## What the human did

- Set the product direction and made the product decisions
- Chose the stack constraints (shadcn/ui only, no full emoji picker, violet
  reserved for agents, skeletons rather than "Loading…")
- Reviewed, requested changes, and rejected proposals — several designs were
  thrown out and rebuilt on request
- Owned all credentials, the hosting account, merges, and releases

## How the output was checked

Nothing here rests on the code looking right.

- Every feature is exercised against the **deployed** stack through the web
  origin, the same path a browser takes: auth, workspaces, documents, presence,
  chat, share links, membership, agents, runs, MCP, collaboration
- Negative cases are covered as well as positive ones: a viewer guest
  attempting a write, a revoked share link, a revoked MCP token, a forged
  collaboration token, cross-organisation access
- Collaboration is verified with three real clients against production —
  edits and cursors propagating, a viewer's write never escaping their own tab,
  and an edit surviving every client disconnecting
- CI runs typecheck, lint, and both builds on every push

Current state: 90 of 90 checks passing against production.

The most useful thing this caught was not a failing assertion but a set of
checks passing against a *stale deployment*, which is how the build-cache
failure — and through it the third-party cookie bug — was found. AI-written
code that passes its own tests is not the same as working software; that gap
is the reason the verification above runs against production rather than a
local mock.

## AI inside the product

Distinct from the AI used to build it: Alongside is an application that runs AI
agents. Users bring their own API key for Anthropic, OpenAI, Google, Kimi,
DeepSeek, MiniMax, Mistral, OpenRouter, or any OpenAI-compatible endpoint. No
model provider is bundled and no shared key ships with the project — keys are
supplied by the user, sealed with AES-256-GCM, and never leave the server.

See the README for the architecture and the reasoning behind it.
