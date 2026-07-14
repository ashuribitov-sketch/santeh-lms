'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
      } else {
        setUser(user);
      }
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!user) return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '50px auto' }}>
      <h1>Кабинет педагога</h1>
      <p>Добро пожаловать, {user.email}!</p>
      <p>Здесь вы сможете назначать тесты и смотреть статистику.</p>
      <button onClick={handleSignOut}>Выйти</button>
    </div>
  );
}