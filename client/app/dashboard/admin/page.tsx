'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button, Typography } from 'antd';
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
      <Title level={2} style={titleStyle}>Кабинет администратора</Title>
      <p style={textStyle}>Добро пожаловать, {fullName || user.email}!</p>
      <div style={{ margin: '20px 0' }}>
        <Link href="/dashboard/admin/courses">
          <Button type="primary" size="large">Управление курсами и тестами</Button>
        </Link>
      </div>
    </div>
  );
}