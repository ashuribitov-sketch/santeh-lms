'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Button, Card, Modal, Input, message, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*');
    setCourses(data || []);
  };

  const handleCreateCourse = async () => {
    const { error } = await supabase.from('courses').insert({ title, description });
    if (error) {
      message.error('Ошибка: ' + error.message);
    } else {
      message.success('Курс создан!');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchCourses();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Управление курсами</Title>
      
      <Space orientation="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Добавить курс
        </Button>

        {courses.map((course) => (
          <Link href={`/dashboard/admin/courses/${course.id}`} key={course.id}>
            <Card title={course.title} style={{ width: '100%', cursor: 'pointer' }}>
              <p>{course.description || 'Описание отсутствует'}</p>
            </Card>
          </Link>
        ))}
      </Space>

      <Modal
        title="Создать курс"
        open={isModalOpen}
        onOk={handleCreateCourse}
        onCancel={() => setIsModalOpen(false)}
      >
        <Input 
          placeholder="Название курса" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ marginBottom: 12 }} 
        />
        <Input.TextArea 
          placeholder="Описание" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
      </Modal>
    </div>
  );
}