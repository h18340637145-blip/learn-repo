# NodePath Architecture Harness

## Snapshot

NodePath is currently a single-route Next.js 16 App Router application.

```text
app/layout.tsx
  -> app/page.tsx
    -> app/learning-studio.tsx
      -> lesson data
      -> answer state
      -> runtime frame animation
      -> visualizer UI

app/globals.css
  -> global design tokens
  -> app layout
  -> responsive rules

public/og.png
  -> social preview image
```

## Framework

- Next.js `16.2.10`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4 via `@import "tailwindcss"`
- ESLint flat config

This project uses the App Router. `app/layout.tsx` and `app/page.tsx` are Server
Components by default. `app/learning-studio.tsx` is a Client Component because
it uses `useState`, `useRef`, click handlers, and `window.setTimeout`.

Before changing framework behavior, check the local docs under:

```text
node_modules/next/dist/docs/
```

## Runtime Boundaries

Current execution model:

- Browser renders the learning studio.
- User selects an answer.
- Client state determines whether the answer is correct.
- Correct answers step through deterministic `RunnerFrame` data.
- The terminal panel displays predefined log lines.

There is no backend API, database, authentication, or arbitrary code execution
in the current implementation.

## Data Model

The central model is the `Lesson` type in `app/learning-studio.tsx`.

Important fields:

- `id`: stable lesson identifier.
- `eyebrow`, `title`, `duration`: display metadata.
- `concept`, `points`: explanation content.
- `code`: code sample shown to learners.
- `question`, `options`, `answer`: prediction challenge.
- `lanes`: visualizer lanes.
- `frames`: runtime animation frames.
- `summary`: completion summary.
- `project`: optional flag for stage-project styling and copy.

The `RunnerFrame` type drives the visualizer:

- `activeLane`: highlighted lane index.
- `laneValues`: per-lane labels for the current step.
- `log`: terminal output shown at the current step.
- `note`: explanatory caption.

## State Flow

```text
openLesson(index)
  -> reset selected answer, status, and frame index

chooseAnswer(answer)
  -> wrong answer: status = "wrong"
  -> correct answer: status = "running"
    -> iterate lesson.frames with delays
    -> update frameIndex
    -> status = "success"

nextLesson()
  -> open the next lesson
```

`runToken` prevents stale animations from mutating state after the learner
switches lessons or chooses another answer.

## Styling Architecture

The app currently uses one global stylesheet:

- CSS custom properties define the palette.
- Layout classes define top bar, sidebar, lesson panels, challenge, runtime
  visualizer, terminal, and completion summary.
- Responsive breakpoints at `1050px` and `760px` adapt the workspace to tablet
  and mobile.
- `prefers-reduced-motion` disables meaningful animation for reduced-motion
  users.

If the UI grows, consider splitting presentation into colocated components
before splitting CSS. The current single stylesheet is still manageable.

## Metadata

`app/layout.tsx` exports static metadata:

- Chinese title and description.
- `metadataBase` from `NEXT_PUBLIC_SITE_URL` with local fallback.
- Open Graph and Twitter image references to `/og.png`.

Keep remote fonts out of this file unless the build environment is known to
allow external font fetching.

## Extension Points

Recommended next architecture steps:

- Move lesson data into `lib/lessons.ts` or `content/lessons/*.ts`.
- Split UI into focused components:
  - `RoadmapSidebar`
  - `LessonHeader`
  - `ConceptPanel`
  - `CodePanel`
  - `Challenge`
  - `RuntimeVisualizer`
  - `SummaryPanel`
- Add persistent progress with Supabase or another store.
- Add lesson unlock rules derived from completion state.
- Add a safe execution service for real Node.js code.

## Safe Execution Direction

Do not run learner-submitted code directly in the Next.js process.

Safer options include:

- Isolated worker process with strict timeout and memory limits.
- Containerized execution service.
- WebAssembly-based JavaScript runtime where appropriate.
- Pre-authored execution traces for beginner lessons.

Any real execution path should define:

- Input limits.
- Timeout.
- Memory cap.
- File system access policy.
- Network access policy.
- Log capture.
- Error serialization.

## Validation

Use:

```bash
npm run lint
npm run build
git diff --check
```

For documentation-only changes, `git diff --check` is sufficient.
