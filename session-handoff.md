# Session Handoff

## Current State

Project: NodePath, a visual Node.js learning website built on Next.js 16.

Current branch:

```text
codex/nodepath-curriculum-foundation
```

The app is now a curriculum-backed learning prototype. The UI still renders the same learning studio on `/`, but course data, curriculum structure, authored trace execution, validation, and progress storage have been split into focused modules.

Expected dirty state after this session:

- `.superpowers/brainstorm/8292-1784101222/.server-info` deleted.
- `.superpowers/brainstorm/8292-1784101222/.server-stopped` untracked.

Those files came from the earlier visual brainstorming server and are intentionally not part of this implementation.

## What Exists

Curriculum foundation:

- 10 required stages.
- 80 planned knowledge points.
- 10 planned stage projects.
- 4 currently published playable cases.

Published cases:

- CommonJS `require` cache.
- Event Loop output order.
- Stream backpressure.
- Stage project: CLI log analyzer.

Core interaction:

- Learner reads concept and code.
- Learner chooses an answer.
- Wrong answer shows option-specific feedback.
- Correct answer starts a cancellable authored trace.
- Terminal panel shows simulated logs.
- Summary appears after completion.
- Completion is saved to browser local progress and restored after refresh.

Important product boundary:

- The current app uses deterministic authored traces.
- It does not execute arbitrary Node.js code.
- A real sandbox remains a separate future plan.

## Important Files

- `content/curriculum.ts`: 10-stage/80-point master curriculum catalog.
- `content/legacy-lessons.ts`: migrated original 4 prototype cases.
- `content/lesson-registry.ts`: published lesson registry and migration metadata.
- `lib/curriculum/types.ts`: shared curriculum and lesson types.
- `lib/curriculum/validate.ts`: catalog and lesson validators.
- `lib/curriculum/view-model.ts`: roadmap view model.
- `lib/execution/authored-trace.ts`: cancellable authored trace runner.
- `lib/progress/*`: local progress repository boundary.
- `scripts/validate-curriculum.ts`: curriculum validation CLI.
- `app/learning-studio.tsx`: client learning studio consuming registry, roadmap, runner, and progress.
- `app/globals.css`: visual system and responsive behavior.
- `docs/PRODUCT.md`: product and curriculum harness.
- `docs/ARTICHECTURE.md`: architecture harness.

## Validation History

Latest automatic validation for the curriculum foundation:

```bash
npm run validate:curriculum
npm test
npm run lint
npm run build
git diff --check
```

Expected `validate:curriculum` output:

```text
课程校验通过：10 个阶段，4 个已发布案例。
```

Notes:

- `npm test` uses `tsx`; in this sandbox it may need permission because `tsx` creates a local IPC pipe.
- `npm run build` may need permission because Turbopack can bind a local port for CSS processing.
- Next may warn about multiple lockfiles and infer a workspace root above this project. That warning has not blocked successful builds.

## Next Recommended Work

Highest-value next plan:

1. Build stages 01–03 content from official Node.js learning docs.
2. Add at least 3 question variants per knowledge point.
3. Add visualizers beyond `lane-flow` for module resolution and event loop flow.
4. Keep normal lessons on authored traces.
5. Design the first real sandbox separately for later stage projects.

Later plans:

- Stages 04–06 content plus Stream/HTTP visualizers.
- Stages 07–10 content plus concurrency, security, and diagnostics visualizers.
- Final real-time collaboration project.
- Supabase-backed user progress and cross-device sync.

## Operating Notes

- Use npm because `package-lock.json` is present.
- Read local Next docs before changing framework-level code.
- Preserve the current dark developer-lab visual direction.
- Keep the learning experience as the first screen.
- Avoid remote Google fonts.
- Do not overwrite unrelated dirty worktree changes.
