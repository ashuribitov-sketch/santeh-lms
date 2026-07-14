'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from 'antd';
import Link from 'next/link';

export default function AdminDashboard() {
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
      <h1>Кабинет администратора</h1>
      <p>Добро пожаловать, {user.email}!</p>
      <div style={{ margin: '20px 0' }}>
        <Link href="/dashboard/admin/courses">
          <Button type="primary">Управление курсами и тестами</Button>
        </Link>
      </div>
      <Button onClick={handleSignOut}>Выйти</Button>
    </div>
  );
}