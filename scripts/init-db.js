async function main() {
  const { Client } = await import('pg');
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("缺少 DATABASE_URL 环境变量，无法初始化 Supabase 数据表。");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        course_id TEXT NOT NULL,
        snapshot JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      );
      
      -- Set up Row Level Security
      ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
      
      -- Create policies
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view their own progress' AND tablename = 'user_progress') THEN
          CREATE POLICY "Users can view their own progress" 
            ON user_progress FOR SELECT 
            USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can insert their own progress' AND tablename = 'user_progress') THEN
          CREATE POLICY "Users can insert their own progress" 
            ON user_progress FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update their own progress' AND tablename = 'user_progress') THEN
          CREATE POLICY "Users can update their own progress" 
            ON user_progress FOR UPDATE 
            USING (auth.uid() = user_id);
        END IF;
      END
      $$;
    `);
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

main();
