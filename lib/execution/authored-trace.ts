import type { RunnerFrame } from "../curriculum/types";

const wait = (milliseconds: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal?.aborted || milliseconds === 0) return resolve();
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });

export async function* streamAuthoredTrace(
  frames: readonly RunnerFrame[],
  signal?: AbortSignal
): AsyncGenerator<RunnerFrame> {
  for (const frame of frames) {
    if (signal?.aborted) return;
    await wait(frame.delayMs, signal);
    if (signal?.aborted) return;
    yield frame;
  }
}
