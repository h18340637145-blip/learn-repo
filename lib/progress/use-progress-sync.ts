import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { ProgressSnapshot } from './types';
import type { CourseId } from '../curriculum/types';
import { getBrowserProgressRepository } from './browser-progress-repository';

export function useProgressSync(
  courseId: CourseId,
  localProgress: ProgressSnapshot,
  setLocalProgress: (snapshot: ProgressSnapshot) => void
) {
  // Sync on mount
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
          if (error) {
            console.warn("Could not load remote progress:", error.message);
            return;
          }
          if (data && data.snapshot) {
            const remoteSnapshot = data.snapshot as ProgressSnapshot;
            const localDate = new Date(localProgress.updatedAt || 0).getTime();
            const remoteDate = new Date(remoteSnapshot.updatedAt || 0).getTime();
            
            if (remoteDate > localDate) {
              const repository = getBrowserProgressRepository(courseId);
              const savedSnapshot = repository.replace(remoteSnapshot);
              
              setLocalProgress(savedSnapshot);
            } else if (localDate > remoteDate) {
              supabase
                .from('user_progress')
                .upsert({
                   user_id: user.id,
                   course_id: courseId,
                   snapshot: localProgress,
                   updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, course_id' })
                .then();
            }
          }
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]); // purposely only run on mount and courseId change

  // Upload changes (debounced)
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
