# NodePath Product Harness

## Product Summary

NodePath is a visual learning website for Node.js. It helps learners build a
runtime mental model by moving through three actions:

1. Read a compact explanation of one Node.js concept.
2. Predict the behavior of a code sample.
3. Choose the correct answer and watch the runtime visualization execute.

The product should feel like a learning lab, not a marketing page. The first
screen should remain the actual learning experience.

## Target Learner

The primary learner already knows basic JavaScript syntax and wants to
understand how Node.js behaves in real programs. They benefit from seeing what
happens inside modules, queues, streams, files, APIs, and project structure.

The experience should optimize for memory:

- Small concepts.
- Concrete code.
- Prediction before explanation.
- Visual execution.
- Terminal output.
- Short summaries.
- Periodic projects that combine previous knowledge.

## Current Experience

The current app is a single-page interactive prototype named NodePath.

Implemented lesson patterns:

- Concept panel on the left.
- Code sample on the right.
- Multiple-choice prediction below.
- Correct answer triggers visual runtime frames.
- Terminal panel prints the simulated result.
- Summary panel appears after successful completion.
- Sidebar shows a learning path and project entry point.

Current playable lessons:

- CommonJS `require` cache.
- Event Loop order.
- Stream backpressure.
- Stage project: CLI log analyzer.

Current final project preview:

- Realtime collaboration task platform.
- Intended coverage: API, streams, auth, testing, deployment.

## Learning Flow

Each knowledge point follows this loop:

```text
Concept -> Code Case -> Prediction -> Correct Answer -> Runtime Visualizer -> Summary
```

Each stage project follows the same interaction model but combines knowledge
from earlier lessons:

```text
Project Brief -> Incomplete Code -> Choice -> Simulated Run -> Visual Result -> Knowledge Summary
```

After all knowledge points are complete, the learner should unlock a larger
project that covers most course topics.

## Content Roadmap

Current sidebar roadmap:

- Node.js basics: runtime, globals, module system, cache.
- Async runtime: event loop, promises, async control.
- Files and streams: Buffer, stream, backpressure.
- Network and APIs: HTTP server, REST API.
- Engineering quality: testing, performance, security.

Recommended next content expansion:

- `process`, `Buffer`, and `path`.
- ESM vs CommonJS.
- `fs/promises` and error handling.
- `EventEmitter`.
- HTTP server request lifecycle.
- npm scripts and package boundaries.
- Testing with Node's built-in test runner.

## Product Principles

- Keep the learner inside the doing loop.
- Prefer visual cause and effect over long prose.
- Make wrong answers useful, not punitive.
- Every lesson should end with a memorable rule.
- Projects should reuse earlier concepts explicitly.
- The UI should be dense enough for study and calm enough for repeated use.

## Current Boundary

The app currently simulates execution through predefined frames. It does not run
arbitrary Node.js code from the browser.

When adding real execution, use a sandboxed server-side or isolated runtime
design. Do not execute learner-submitted code in the Next.js server process.

## Success Criteria

Short term:

- A learner can complete the existing lessons without instructions.
- The visualizer clearly connects code behavior to runtime state.
- The app builds with `npm run build`.

Medium term:

- Full Node.js course content is represented as structured lesson data.
- Progress is saved per learner.
- Stage projects unlock based on progress.
- Lesson content can be authored without editing UI code.

Long term:

- Safe Node.js execution sandbox.
- Rich project outputs, including logs, diagrams, and small rendered apps.
- Final project that synthesizes most course knowledge.
