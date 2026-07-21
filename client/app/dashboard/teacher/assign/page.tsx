'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Button, Select, Input, message, Space, Typography, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function AssignTestPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*');
    setCourses(data || []);
  };

  const fetchTests = async (courseId: string) => {
    const { data } = await supabase.from('tests').select('*').eq('course_id', courseId);
    setTests(data || []);
  };

  const fetchStudents = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'student');
    setStudents(profiles || []);
  };

  // Фильтруем учеников по введённому имени
  const filteredStudents = useMemo(() => {
    if (!searchName.trim()) return students;
    const lower = searchName.toLowerCase();
    return students.filter((s) => {
      const name = (s.full_name || '').toLowerCase();
      return name.includes(lower) || s.id.toLowerCase().includes(lower);
    });
  }, [students, searchName]);

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    fetchTests(value);
    setSelectedTest(null);
  };

  const handleAssign = async () => {
    if (!selectedTest || !selectedStudent) {
      message.warning('Выберите тест и ученика');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      message.error('Вы не авторизованы');
      return;
    }

    const { error } = await supabase.from('assignments').insert({
      test_id: selectedTest,
      user_id: selectedStudent,
      assigned_by: user.id,
      deadline: deadline ? new Date(deadline).toISOString() : null,
    });

    if (error) {
      message.error('Ошибка: ' + error.message);
    } else {
      message.success('Тест назначен!');
      setSelectedCourse(null);
      setSelectedTest(null);
      setSelectedStudent(null);
      setDeadline(null);
      setTests([]);
      setSearchName('');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Назначить тест ученику</Title>
      <Space orientation="vertical" size="large" style={{ width: '100%', maxWidth: 500 }}>
        <Select
          placeholder="Выберите курс"
          style={{ width: '100%' }}
          value={selectedCourse}
          onChange={handleCourseChange}
          options={courses.map((c) => ({ value: c.id, label: c.title }))}
        />

        {selectedCourse && (
          <Select
            placeholder="Выберите тест"
            style={{ width: '100%' }}
            value={selectedTest}
            onChange={setSelectedTest}
            options={tests.map((t) => ({ value: t.id, label: t.title }))}
          />
        )}

        {/* Поиск по ученикам */}
        <Input
          placeholder="Поиск ученика по имени"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          allowClear
        />

        <Select
          placeholder="Выберите ученика"
          style={{ width: '100%' }}
          value={selectedStudent}
          onChange={setSelectedStudent}
          options={filteredStudents.map((s) => ({
            value: s.id,
            label: s.full_name ? s.full_name : `Безымянный (${s.id.slice(0, 8)}…)`,
          }))}
        />

        <DatePicker
          style={{ width: '100%' }}
          placeholder="Дедлайн (необязательно)"
          value={deadline ? dayjs(deadline) : null}
          onChange={(date) => setDeadline(date ? date.toISOString() : null)}
        />

        <Button type="primary" onClick={handleAssign}>
          Назначить
        </Button>
      </Space>
    </div>
  );
}