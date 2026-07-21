'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Input, Button, message, Typography } from 'antd';

const { Title } = Typography;

export default function TeacherProfilePage() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (data?.full_name) setFullName(data.full_name);
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);
    if (error) {
      message.error('Ошибка при сохранении');
    } else {
      message.success('Профиль обновлён');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <Title level={3}>Редактировать профиль</Title>
      <Input
        placeholder="Ваше ФИО"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Button type="primary" onClick={handleSave} loading={loading}>
        Сохранить
      </Button>
    </div>
  );
}