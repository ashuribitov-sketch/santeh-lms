'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, Space, Typography, Button, Tag } from 'antd';
import Link from 'next/link';

const { Title } = Typography;

interface AssignmentWithStatus {
  id: string;
  test: {
    id: string;
    title: string;
    time_limit_seconds: number;
  } | null;
  deadline: string | null;
  resultStatus?: string | null; // 'passed', 'failed', 'timeout', или null если не завершён
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentWithStatus[]>([]);

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
        fetchAssignments(user.id);
      }
    };
    getUser();
  }, []);

  const fetchAssignments = async (userId: string) => {
    // Получаем назначения с информацией о тесте
    const { data } = await supabase
      .from('assignments')
      .select('id, test:tests(id, title, time_limit_seconds), deadline')
      .eq('user_id', userId);

    if (!data) {
      setAssignments([]);
      return;
    }

    // Для каждого назначения проверяем, есть ли завершённый результат
    const enriched = await Promise.all(
      data.map(async (item: any) => {
        let resultStatus = null;
        if (item.test?.id) {
          const { data: results } = await supabase
            .from('test_results')
            .select('status')
            .eq('user_id', userId)
            .eq('test_id', item.test.id)
            .neq('status', 'in_progress')   // только завершённые
            .limit(1);
          if (results && results.length > 0) {
            resultStatus = results[0].status;
          }
        }
        return { ...item, resultStatus };
      })
    );

    setAssignments(enriched);
  };

  if (!user) return <div>Загрузка...</div>;

  return (
    <div>
      <Title level={2}>Мои тесты</Title>
      <p>Добро пожаловать, {fullName || user.email}!</p>
      <Space orientation="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
        {assignments.length === 0 && <p>У вас пока нет назначенных тестов.</p>}
        {assignments.map((a) => {
          const isCompleted = !!a.resultStatus;
          return (
            <Card key={a.id} title={a.test?.title || 'Тест удалён'}>
              <p>Время на тест: {a.test?.time_limit_seconds} сек</p>
              {a.deadline && <p>Дедлайн: {new Date(a.deadline).toLocaleString()}</p>}
              {isCompleted ? (
                <div>
                  <Tag color={a.resultStatus === 'passed' ? 'green' : a.resultStatus === 'failed' ? 'red' : 'orange'}>
                    {a.resultStatus === 'passed' ? 'Сдал' : a.resultStatus === 'failed' ? 'Не сдал' : 'Время истекло'}
                  </Tag>
                  <Link href={`/dashboard/student/test/${a.id}`}>
                    <Button type="default" style={{ marginLeft: 8 }}>Посмотреть результат</Button>
                  </Link>
                </div>
              ) : (
                <Link href={`/dashboard/student/test/${a.id}`}>
                  <Button type="primary">Пройти тест</Button>
                </Link>
              )}
            </Card>
          );
        })}
      </Space>
    </div>
  );
}