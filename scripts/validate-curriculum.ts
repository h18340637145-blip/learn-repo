import { curriculum } from "../content/curriculum";
import { publishedLessons } from "../content/lesson-registry";
import { validateCatalog, validateLessonSpec } from "../lib/curriculum/validate";

const errors = [
  ...validateCatalog(curriculum),
  ...publishedLessons.flatMap(validateLessonSpec)
];

if (errors.length > 0) {
  for (const error of errors) console.error(`课程校验失败：${error}`);
  process.exitCode = 1;
} else {
  console.log(`课程校验通过：${curriculum.length} 个阶段，${publishedLessons.length} 个已发布案例。`);
}
