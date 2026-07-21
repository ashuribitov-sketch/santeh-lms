'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button, Space, Typography } from 'antd';
import Link from 'next/link';

const { Title } = Typography;

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(0, 86, 185, 0.6), 0 0 2px rgba(0,0,0,0.8)',
};

const textStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.9)',
  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
};

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
      } else {
        setUser(user);
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
      <Title level={2} style={titleStyle}>Кабинет педагога</Title>
      <p style={textStyle}>Добро пожаловать, {fullName || user.email}!</p>
      <Space orientation="vertical" size="middle" style={{ marginTop: 20 }}>
        <Link href="/dashboard/teacher/assign">
          <Button type="primary" size="large">Назначить тест</Button>
        </Link>
        <Link href="/dashboard/teacher/results">
          <Button size="large">Результаты тестов</Button>
        </Link>
      </Space>
    </div>
  );
}