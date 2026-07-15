# Session Handoff

## Current State

Project: NodePath, a visual Node.js learning website built on Next.js 16.

The current app has been transformed from a starter page into a single-page
interactive learning prototype. The product experience is implemented in
`app/learning-studio.tsx` and rendered by `app/page.tsx`.

The worktree is expected to be dirty. At the time this handoff was written,
project-relevant changed files included:

- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/learning-studio.tsx`
- `public/og.png`
- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/ARTICHECTURE.md`
- `session-handoff.md`

`package-lock.json` was already modified before the harness documentation pass.
Do not assume it was changed by the documentation work.

## What Exists

Playable learning cases:

- CommonJS `require` cache.
- Event Loop order.
- Stream backpressure.
- Stage project: CLI log analyzer.

Core interaction:

- Learner reads concept and code.
- Learner chooses an answer.
- Wrong answer shows corrective feedback.
- Correct answer starts a visual runtime animation.
- Terminal panel shows simulated logs.
- Summary appears after completion.

Important product boundary:

- The current app uses deterministic simulations.
- It does not execute arbitrary Node.js code.

## Important Files

- `AGENTS.md`: collaboration and engineering rules.
- `docs/PRODUCT.md`: product intent, learner flow, roadmap, success criteria.
- `docs/ARTICHECTURE.md`: architecture, data model, state flow, extension
  points.
- `app/learning-studio.tsx`: current lesson model and UI implementation.
- `app/globals.css`: visual system and responsive behavior.
- `app/layout.tsx`: metadata and root layout.

## Validation History

Previous implementation validation passed:

```bash
npm run lint
npm run build
git diff --check
```

Notes:

- `npm run build` may need permission to bind a local port in this environment.
- Next may warn about multiple lockfiles and infer a workspace root above this
  project. That warning did not block the previous successful build.

## Next Recommended Work

Highest-value next steps:

1. Move lesson data out of `app/learning-studio.tsx` into a content module.
2. Add more Node.js lessons following the current `Lesson` shape.
3. Add progress persistence and unlock logic.
4. Decide whether real Node.js execution is required or whether authored traces
   are enough for early course content.
5. If real execution is required, design an isolated sandbox before writing any
   API route.

## Operating Notes

- Use npm because `package-lock.json` is present.
- Read local Next docs before changing framework-level code.
- Preserve the current dark developer-lab visual direction.
- Keep the learning experience as the first screen.
- Avoid remote Google fonts.
- Do not overwrite unrelated dirty worktree changes.
