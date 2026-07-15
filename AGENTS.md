# Agent Harness

This repository is a Next.js 16 App Router project for **NodePath**, a visual
Node.js learning website. Treat this file as the first stop for any human or
agent working in this checkout.

## Critical Framework Rule

This is not the Next.js you know.

Next.js is pinned to `16.2.10`, and this version may differ from older training
data. Before writing application code, read the relevant guide in:

```text
node_modules/next/dist/docs/
```

For the current app shape, the most relevant local docs are:

- `01-app/01-getting-started/02-project-structure.md`
- `01-app/01-getting-started/05-server-and-client-components.md`
- `01-app/03-api-reference/04-functions/generate-metadata.md`

## Project Intent

NodePath teaches Node.js through prediction, controlled execution, and visual
runtime feedback. A learner reads a concept, studies a code sample, chooses an
answer, and then sees a step-by-step visualizer plus terminal output.

The current implementation is an interactive product prototype. It does not yet
execute arbitrary user-provided Node.js code in a sandbox. Lesson execution is
currently represented by deterministic lesson frames in the client component.

## Current Code Map

- `app/page.tsx` renders the learning studio on `/`.
- `app/learning-studio.tsx` contains the lesson data, answer handling, and
  runtime visualization UI.
- `app/layout.tsx` defines Chinese metadata and references `public/og.png`.
- `app/globals.css` contains the full visual system and responsive layout.
- `public/og.png` is the current Open Graph image.
- `docs/PRODUCT.md` describes product goals, learner flow, content model, and
  roadmap.
- `docs/ARTICHECTURE.md` describes architecture, state boundaries, and extension
  points.
- `session-handoff.md` records the current session state and next recommended
  work.

## Working Rules

- Preserve user changes. The worktree may already be dirty.
- Keep edits scoped to the requested product or documentation surface.
- Prefer data-driven lesson additions over hard-coded one-off UI branches.
- Keep `app/layout.tsx` as a Server Component unless interactivity is required.
- Keep interactive learner state inside client components such as
  `app/learning-studio.tsx`.
- Do not reintroduce `next/font/google`; remote font fetching has caused build
  failures in similar local environments.
- If adding auth, persistence, or external services, keep secrets server-side
  and document required environment variables.

## Commands

Use npm, because this checkout has `package-lock.json`.

```bash
npm run dev
npm run lint
npm run build
```

Notes:

- `npm run build` may require permission to bind a local port because Turbopack
  can use a local CSS processing service.
- ESLint is configured in `eslint.config.mjs`; generated folders such as
  `.next/**` are ignored.

## Product Boundaries

Current scope:

- Visual Node.js learning path.
- Concept explanation plus code sample.
- Multiple-choice prediction.
- Correct answer triggers simulated runtime frames and terminal logs.
- Stage project pattern.
- Final project preview.

Not yet implemented:

- Real Node.js compilation or sandboxed execution.
- User accounts, saved progress, or Supabase persistence.
- Authoring UI for lessons.
- Full course content for all Node.js topics.
- Production deployment configuration.

## Quality Bar

Before handing off code changes, run:

```bash
npm run lint
npm run build
git diff --check
```

For documentation-only changes, at minimum run:

```bash
git diff --check
```

When changing responsive UI, manually inspect desktop and mobile widths.
