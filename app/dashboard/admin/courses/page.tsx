'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Button, Card, Modal, Input, message, Space, Typography, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(0, 86, 185, 0.6), 0 0 2px rgba(0,0,0,0.8)',
  marginBottom: 24,
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*');
    setCourses(data || []);
  };

  const handleCreateOrUpdate = async () => {
    if (editingCourse) {
      const { error } = await supabase.from('courses').update({ title, description }).eq('id', editingCourse.id);
      if (error) message.error('Ошибка: ' + error.message);
      else message.success('Курс обновлён!');
    } else {
      const { error } = await supabase.from('courses').insert({ title, description });
      if (error) message.error('Ошибка: ' + error.message);
      else message.success('Курс создан!');
    }
    setIsModalOpen(false);
    setEditingCourse(null);
    setTitle('');
    setDescription('');
    fetchCourses();
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) message.error('Ошибка: ' + error.message);
    else message.success('Курс удалён!');
    fetchCourses();
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={titleStyle}>Управление курсами</Title>

      <Space orientation="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCourse(null); setTitle(''); setDescription(''); setIsModalOpen(true); }}>
          Добавить курс
        </Button>

        {courses.map((course) => (
          <Card
            key={course.id}
            title={course.title}
            style={{ width: '100%' }}
            extra={
              <Space>
                <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEdit(course); }} />
                <Popconfirm
                  title="Удалить курс?"
                  description="Все тесты, вопросы и материалы будут удалены."
                  onConfirm={() => handleDelete(course.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                </Popconfirm>
              </Space>
            }
          >
            <Link href={`/dashboard/admin/courses/${course.id}`}>
              <p>{course.description || 'Описание отсутствует'}</p>
            </Link>
          </Card>
        ))}
      </Space>

      <Modal
        title={editingCourse ? 'Редактировать курс' : 'Создать курс'}
        open={isModalOpen}
        onOk={handleCreateOrUpdate}
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