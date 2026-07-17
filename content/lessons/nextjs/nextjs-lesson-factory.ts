import { createLessonSpec, type LessonInput } from "../lesson-factory";

type NextjsLessonInput = Omit<LessonInput, "nodeVersion"> & {
  nodeVersion?: string;
};

export function createNextjsLessonSpec(input: NextjsLessonInput) {
  return createLessonSpec({
    ...input,
    nodeVersion: input.nodeVersion ?? "Next.js 16.x"
  });
}
