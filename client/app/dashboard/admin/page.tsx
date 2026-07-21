'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button, Typography } from 'antd';
import Link from 'next/link';

const { Title } = Typography;

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
      } else {
        setUser(user);
        // Загружаем полное имя из profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profile?.full_name) {
          setFullName(profile.full_name);
        }
      }
    };
    getUser();
  }, []);

  if (!user) return <div>Загрузка...</div>;

  return (
    <div>
      <Title level={2}>Кабинет администратора</Title>
      <p>Добро пожаловать, {fullName || user.email}!</p>
      <div style={{ margin: '20px 0' }}>
        <Link href="/dashboard/admin/courses">
          <Button type="primary">Управление курсами и тестами</Button>
        </Link>
      </div>
    </div>
  );
}