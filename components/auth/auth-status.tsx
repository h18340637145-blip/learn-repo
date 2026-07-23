'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    // Initial fetch
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (user) {
    return (
      <button 
        className="avatar" 
        type="button" 
        aria-label="打开个人中心"
        onClick={() => supabase.auth.signOut()}
        title="点击登出"
      >
        {user.email?.slice(0, 2).toUpperCase() || "Me"}
      </button>
    );
  }

  return (
    <Link 
      href="/login" 
      style={{
        padding: '6px 12px',
        background: 'var(--green)',
        color: 'var(--panel)',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        textDecoration: 'none'
      }}
    >
      登录
    </Link>
  );
}
