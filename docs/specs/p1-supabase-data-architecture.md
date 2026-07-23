# P1 Supabase 数据架构与同步规范 (Supabase Data Architecture)

> **所属主文档**：[P1 阶段开发总纲](file:///Users/huo2wx/coding/react/learning-app/with-supabase/docs/P1-DEVELOPMENT-GUIDE.md)  
> **适用模块**：`lib/progress/*` / `supabase-migration.sql` / `utils/supabase/*`  

---

## 1. 架构目标与离线优先原则 (Offline-First Architecture)

NodePath 采用**离线优先 (Offline-First)**的架构设计：
- 用户在无网或未登录状态下，所有的答题记录与进度依然正常读写本地 `localStorage`。
- 用户登录 Supabase 后，系统静默启动 `useProgressSync`，将本地进度与云端数据无缝合并。

---

## 2. PostgreSQL 数据库 Schema

在根目录 `supabase-migration.sql` 的基础上，P1 阶段扩展以下数据表定义：

```sql
-- 1. 用户 Profile 表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  username TEXT,
  avatar_url TEXT,
  streak_count INT DEFAULT 0,
  last_active_date DATE
);

-- 2. 课程总体进度快照表
CREATE TABLE IF NOT EXISTS public.progress_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  completed_lesson_ids TEXT[] DEFAULT '{}',
  completed_project_ids TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- 3. 题目级作答历史与艾宾浩斯记录表
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  last_selected_option_id TEXT,
  attempts_count INT DEFAULT 1,
  is_first_try_correct BOOLEAN DEFAULT false,
  easiness_factor NUMERIC(3,2) DEFAULT 2.50,
  interval_days INT DEFAULT 1,
  next_review_at TIMESTAMP WITH TIME ZONE,
  review_state TEXT DEFAULT 'new',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id, question_id)
);

-- 4. 启用 Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- 5. RLS 安全策略：用户仅能读写自身数据
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own progress" ON public.progress_snapshots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert/update own progress" ON public.progress_snapshots
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own attempts" ON public.question_attempts
  FOR ALL USING (auth.uid() = user_id);
```

---

## 3. 云端与本地数据同步合并算法 (Merge Strategy)

同步由客户端 Hook `useProgressSync` 触发：

```typescript
// lib/progress/sync-strategy.ts

export function mergeSnapshots(
  local: ProgressSnapshot,
  cloud: ProgressSnapshot
): ProgressSnapshot {
  // 1. 完成的课程 ID 取并集 (Union)
  const completedLessonIds = Array.from(
    new Set([...local.completedLessonIds, ...cloud.completedLessonIds])
  );
  
  // 2. 完成的项目 ID 取并集
  const completedProjectIds = Array.from(
    new Set([...local.completedProjectIds, ...cloud.completedProjectIds])
  );

  // 3. 题目尝试按 updated_at 采取 Last-Write-Wins (LWW)
  const questionAttempts = { ...cloud.questionAttempts };
  Object.entries(local.questionAttempts).forEach(([qId, localAttempt]) => {
    const cloudAttempt = cloud.questionAttempts[qId];
    if (!cloudAttempt || new Date(localAttempt.lastAttemptAt) > new Date(cloudAttempt.lastAttemptAt)) {
      questionAttempts[qId] = localAttempt;
    }
  });

  return {
    courseId: local.courseId,
    completedLessonIds,
    completedProjectIds,
    questionAttempts,
    updatedAt: new Date().toISOString()
  };
}
```

---

## 4. 验收标准 Checklists

- [ ] 在 Supabase 后台运行 SQL Migration 脚本，无语法错误。
- [ ] 未登录状态下刷题 -> 点击登录 Supabase -> 页面无缝刷新并保留本地已刷题目与完成进度。
- [ ] 切换设备登录同一账号，之前设备上的题目尝试历史与艾宾浩斯复习队列完全一致。
