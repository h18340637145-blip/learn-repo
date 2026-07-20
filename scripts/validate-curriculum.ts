import { allCourses } from "../content/curriculum-registry";
import { getLessonsByCourse } from "../content/lesson-registry";
import { validateCourseCatalog, validateLessonSpec, validateQuestionCoverage } from "../lib/curriculum/validate";

const errors = allCourses.flatMap((course) => [
  ...validateCourseCatalog(course),
  ...getLessonsByCourse(course.id).flatMap(validateLessonSpec)
]);

errors.push(
  ...validateQuestionCoverage(getLessonsByCourse("nodejs"), {
    minKnowledgeQuestions: 2,
    minProjectQuestions: 3,
    minStageQuestionTypes: 3
  }),
  ...validateQuestionCoverage(getLessonsByCourse("nextjs"), {
    minKnowledgeQuestions: 2,
    minProjectQuestions: 3,
    minStageQuestionTypes: 3
  })
);

const courseSummaries = allCourses.map((course) => {
  const lessons = getLessonsByCourse(course.id);
  return `${course.title} ${course.stages.length} 个阶段 ${lessons.length} 个案例`;
});
const totalPublished = allCourses.reduce((sum, course) => sum + getLessonsByCourse(course.id).length, 0);
const nodeQuestionCount = getLessonsByCourse("nodejs")
  .reduce((total, lesson) => total + lesson.questions.length, 0);
const nextQuestionCount = getLessonsByCourse("nextjs")
  .reduce((total, lesson) => total + lesson.questions.length, 0);

if (errors.length > 0) {
  for (const error of errors) console.error(`课程校验失败：${error}`);
  process.exitCode = 1;
} else {
  console.log(`课程校验通过：${courseSummaries.join("，")}，共 ${totalPublished} 个已发布案例。`);
  console.log(`题库覆盖：Node.js ${nodeQuestionCount} 道题，Next.js ${nextQuestionCount} 道题，共 ${nodeQuestionCount + nextQuestionCount} 道题。`);
}
