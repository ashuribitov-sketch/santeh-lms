'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Table, Typography, App } from 'antd';

const { Title } = Typography;

export default function ProfilePage() {
  const { message } = App.useApp();
  const [fullName, setFullName] = useState('');
  const [coins, setCoins] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchLeaderboard();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, coins')
      .eq('id', user.id)
      .single();
    if (profile) {
      setFullName(profile.full_name || '');
      setCoins(profile.coins || 0);
    }
  };

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('game_results')
      .select(`
        id,
        score,
        time_spent,
        questions_answered,
        correct_answers,
        status,
        created_at,
        profiles ( full_name )
      `)
      .order('score', { ascending: false })
      .limit(20);
    if (data) {
      setLeaderboard(data);
    }
  };

  const columns = [
    {
      title: 'Игрок',
      dataIndex: ['profiles', 'full_name'],
      key: 'player',
      render: (_: any, record: any) => record.profiles?.full_name || 'Аноним',
    },
    {
      title: 'Монеты',
      dataIndex: 'score',
      key: 'score',
    },
    {
      title: 'Время (сек)',
      dataIndex: 'time_spent',
      key: 'time',
    },
    {
      title: 'Вопросов',
      dataIndex: 'questions_answered',
      key: 'questions',
    },
    {
      title: 'Правильных',
      dataIndex: 'correct_answers',
      key: 'correct',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const map: Record<string, string> = {
          win: 'Победа',
          lose: 'Поражение',
          timeout: 'Время вышло',
          questions_exhausted: 'Кончились вопросы',
        };
        return map[status] || status;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ color: '#fff' }}>Профиль игрока</Title>
      <p style={{ color: '#fff' }}>ФИО: {fullName || 'Не указано'}</p>
      <p style={{ color: '#ffd700', fontSize: 18 }}>💰 Баланс монет: {coins}</p>
      <Title level={3} style={{ color: '#fff', marginTop: 24 }}>Таблица лидеров</Title>
      <Table
        dataSource={leaderboard}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8 }}
      />
    </div>
  );
}