'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Table, Tag, Typography, Button, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(0, 86, 185, 0.6), 0 0 2px rgba(0,0,0,0.8)',
  marginBottom: 24,
};

export default function TeacherResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        id,
        user_id,
        score,
        max_score,
        status,
        finished_at,
        test:test_id ( title )
      `)
      .neq('status', 'in_progress')
      .order('finished_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки результатов:', error);
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      (data || []).map(async (item: any) => {
        let studentName = 'Неизвестно';
        if (item.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', item.user_id)
            .single();
          if (profile?.full_name) studentName = profile.full_name;
        }
        return {
          ...item,
          studentName,
          testTitle: item.test?.title || 'Тест удалён',
        };
      })
    );

    setResults(enriched);
    setLoading(false);
  };

  const columns = [
    {
      title: 'Ученик',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Тест',
      dataIndex: 'testTitle',
      key: 'testTitle',
    },
    {
      title: 'Балл',
      key: 'score',
      render: (_: any, record: any) => `${record.score}/${record.max_score}`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'passed' ? 'green' : status === 'failed' ? 'red' : 'orange';
        const text = status === 'passed' ? 'Сдал' : status === 'failed' ? 'Не сдал' : 'Время истекло';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Дата завершения',
      dataIndex: 'finished_at',
      key: 'finished_at',
      render: (date: string) => date ? new Date(date).toLocaleString() : '—',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: any) => (
        <Link href={`/dashboard/teacher/results/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />}>Подробнее</Button>
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={titleStyle}>Результаты тестов</Title>
      <Table
        dataSource={results}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}