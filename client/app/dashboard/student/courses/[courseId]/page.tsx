'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import { Card, Typography, Space, Tabs, Button } from 'antd';
import { FilePdfOutlined, FileOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(0, 86, 185, 0.6), 0 0 2px rgba(0,0,0,0.8)',
  marginBottom: 24,
};

export default function StudentCoursePage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const courseId = segments[segments.length - 1];

  const [courseTitle, setCourseTitle] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    if (courseId && courseId !== 'undefined') {
      fetchCourse();
      fetchMaterials();
      fetchTests();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    const { data } = await supabase.from('courses').select('title').eq('id', courseId).single();
    if (data) setCourseTitle(data.title);
  };

  const fetchMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').eq('course_id', courseId);
    setMaterials(data || []);
  };

  const fetchTests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: assignments } = await supabase
      .from('assignments')
      .select('test_id')
      .eq('user_id', user.id);

    if (!assignments?.length) { setTests([]); return; }

    const assignedTestIds = assignments.map(a => a.test_id);

    const { data: testsData } = await supabase
      .from('tests')
      .select('id, title, time_limit_seconds')
      .eq('course_id', courseId)
      .in('id', assignedTestIds);

    setTests(testsData || []);
  };

  const materialsTab = (
    <Space orientation="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
      {materials.length === 0 && <p style={{ color: '#fff' }}>Материалы пока не добавлены.</p>}
      {materials.map((m) => (
        <Card key={m.id} title={m.title}>
          <p>{m.description}</p>
          <a href={m.file_url} target="_blank" rel="noopener noreferrer">
            <Button icon={m.file_type === 'pdf' ? <FilePdfOutlined /> : <FileOutlined />}>
              Скачать {m.file_name}
            </Button>
          </a>
        </Card>
      ))}
    </Space>
  );

  const testsTab = (
    <Space orientation="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
      {tests.length === 0 && <p style={{ color: '#fff' }}>Нет доступных тестов в этом курсе.</p>}
      {tests.map((test) => (
        <Card key={test.id} title={test.title}>
          <p>Время на тест: {test.time_limit_seconds} сек</p>
          <AssignmentLink testId={test.id} />
        </Card>
      ))}
    </Space>
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={titleStyle}>Курс: {courseTitle}</Title>
      <Tabs 
        defaultActiveKey="materials" 
        items={[
          { key: 'materials', label: <span style={{ color: '#fff' }}>Материалы</span>, children: materialsTab },
          { key: 'tests', label: <span style={{ color: '#fff' }}>Тесты</span>, children: testsTab },
        ]} 
        tabBarStyle={{ color: '#fff' }}
      />
    </div>
  );
}

function AssignmentLink({ testId }: { testId: string }) {
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('assignments')
        .select('id')
        .eq('test_id', testId)
        .eq('user_id', user.id)
        .single();
      if (data) setAssignmentId(data.id);
    };
    fetchAssignment();
  }, [testId]);

  if (!assignmentId) return null;
  return (
    <Link href={`/dashboard/student/test/${assignmentId}`}>
      <Button type="primary">Пройти тест</Button>
    </Link>
  );
}