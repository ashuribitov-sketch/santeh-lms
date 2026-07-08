'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      // Если пользователь не авторизован — сразу на страницу входа
      if (!user) {
        router.push('/auth/login');
      }
    };
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login'); // После выхода переходим на логин
  };

  // Пока идёт проверка — показываем индикатор
  if (loading) {
    return <div>Загрузка...</div>;
  }

  // Если после проверки user всё ещё нет — ничего не рендерим,
  // потому что уже должен сработать редирект в useEffect
  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: 600, margin: '50px auto' }}>
      <h1>Добро пожаловать, {user.email}</h1>
      <p>Вы вошли в систему.</p>
      <button onClick={handleSignOut}>Выйти</button>
    </div>
  );
}