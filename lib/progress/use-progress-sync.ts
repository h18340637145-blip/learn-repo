import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { ProgressSnapshot } from './types';
import type { CourseId } from '../curriculum/types';
import { getBrowserProgressRepository } from './browser-progress-repository';
import { mergeProgressSnapshots } from './sync-strategy';

export function useProgressSync(
  courseId: CourseId,
  localProgress: ProgressSnapshot,
  setLocalProgress: (snapshot: ProgressSnapshot) => void
) {
  // Sync on mount: Merge local and remote snapshots cleanly
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      supabase
        .from('user_progress')
        .select('snapshot, updated_at')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') {
            console.warn("Could not load remote progress:", error.message);
            return;
          }

          if (data && data.snapshot) {
            const remoteSnapshot = data.snapshot as ProgressSnapshot;
            const merged = mergeProgressSnapshots(localProgress, remoteSnapshot);

            const repository = getBrowserProgressRepository(courseId);
            const savedSnapshot = repository.replace(merged);
            setLocalProgress(savedSnapshot);

            // Push merged state back to remote database
            supabase
              .from('user_progress')
              .upsert({
                 user_id: user.id,
                 course_id: courseId,
                 snapshot: savedSnapshot,
                 updated_at: savedSnapshot.updatedAt
              }, { onConflict: 'user_id, course_id' })
              .then();
          } else {
            // First time syncing for this user & course: upload local progress
            supabase
              .from('user_progress')
              .upsert({
                 user_id: user.id,
                 course_id: courseId,
                 snapshot: localProgress,
                 updated_at: localProgress.updatedAt || new Date().toISOString()
              }, { onConflict: 'user_id, course_id' })
              .then();
          }
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Upload local changes (debounced)
  useEffect(() => {
    if (!localProgress.updatedAt) return;

    const debounceTimer = setTimeout(() => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;

        supabase
          .from('user_progress')
          .upsert({
             user_id: user.id,
             course_id: courseId,
             snapshot: localProgress,
             updated_at: localProgress.updatedAt
          }, { onConflict: 'user_id, course_id' })
          .then(({ error }) => {
            if (error) {
              console.warn("Could not sync progress to remote:", error.message);
            }
          });
      });
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [localProgress, courseId]);
}
