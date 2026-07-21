'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
import { Button, Card, Modal, Input, Select, message, Space, Typography, Tabs, Upload, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(0, 86, 185, 0.6), 0 0 2px rgba(0,0,0,0.8)',
  marginBottom: 24,
};

export default function CourseManagePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [courseTitle, setCourseTitle] = useState('');

  // Тесты
  const [tests, setTests] = useState<any[]>([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [category, setCategory] = useState('1-3');
  const [timeLimit, setTimeLimit] = useState(600);
  const [passingScore, setPassingScore] = useState(70);

  // Материалы
  const [materials, setMaterials] = useState<any[]>([]);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (courseId && courseId !== 'undefined') {
      fetchCourse();
      fetchTests();
      fetchMaterials();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    const { data } = await supabase.from('courses').select('title').eq('id', courseId).single();
    if (data) setCourseTitle(data.title);
  };

  // ------ ТЕСТЫ ------
  const fetchTests = async () => {
    const { data } = await supabase.from('tests').select('*').eq('course_id', courseId);
    setTests(data || []);
  };

  const handleCreateOrUpdateTest = async () => {
    if (editingTest) {
      const { error } = await supabase.from('tests').update({
        title: testTitle,
        description: testDescription,
        category,
        time_limit_seconds: timeLimit,
        passing_score: passingScore,
      }).eq('id', editingTest.id);
      if (error) message.error('Ошибка: ' + error.message);
      else message.success('Тест обновлён!');
    } else {
      const { error } = await supabase.from('tests').insert({
        course_id: courseId,
        title: testTitle,
        description: testDescription,
        category,
        time_limit_seconds: timeLimit,
        passing_score: passingScore,
      });
      if (error) message.error('Ошибка: ' + error.message);
      else message.success('Тест создан!');
    }
    setIsTestModalOpen(false);
    setEditingTest(null);
    setTestTitle(''); setTestDescription(''); setCategory('1-3'); setTimeLimit(600); setPassingScore(70);
    fetchTests();
  };

  const handleEditTest = (test: any) => {
    setEditingTest(test);
    setTestTitle(test.title);
    setTestDescription(test.description || '');
    setCategory(test.category);
    setTimeLimit(test.time_limit_seconds);
    setPassingScore(test.passing_score);
    setIsTestModalOpen(true);
  };

  const handleDeleteTest = async (testId: string) => {
    const { error } = await supabase.from('tests').delete().eq('id', testId);
    if (error) message.error('Ошибка: ' + error.message);
    else { message.success('Тест удалён!'); fetchTests(); }
  };

  // ------ МАТЕРИАЛЫ ------
  const fetchMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').eq('course_id', courseId);
    setMaterials(data || []);
  };

  const handleCreateMaterial = async () => {
    if (!file) { message.warning('Выберите файл'); return; }
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${Date.now()}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage.from('course-materials').upload(fileName, file);
    if (uploadError) { message.error('Ошибка загрузки: ' + uploadError.message); return; }

    const { data: publicUrlData } = supabase.storage.from('course-materials').getPublicUrl(fileName);
    const fileUrl = publicUrlData.publicUrl;

    const { error: insertError } = await supabase.from('materials').insert({
      course_id: courseId,
      title: materialTitle || file.name,
      description: materialDescription,
      file_url: fileUrl,
      file_name: file.name,
      file_type: file.name.split('.').pop()?.toLowerCase() || '',
    });
    if (insertError) message.error('Ошибка сохранения: ' + insertError.message);
    else {
      message.success('Материал добавлен!');
      setIsMaterialModalOpen(false);
      setMaterialTitle(''); setMaterialDescription(''); setFile(null);
      fetchMaterials();
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    const { error } = await supabase.from('materials').delete().eq('id', materialId);
    if (error) message.error('Ошибка: ' + error.message);
    else { message.success('Материал удалён!'); fetchMaterials(); }
  };

  const testsContent = (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTest(null); setIsTestModalOpen(true); }}>
        Добавить тест
      </Button>
      {tests.map((test) => (
        <Card
          key={test.id}
          title={test.title}
          extra={
            <Space>
              <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditTest(test); }} />
              <Popconfirm title="Удалить тест и все вопросы?" onConfirm={() => handleDeleteTest(test.id)} okText="Да" cancelText="Нет">
                <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
              </Popconfirm>
            </Space>
          }
        >
          <Link href={`/dashboard/admin/courses/${courseId}/${test.id}`}>
            <p><b>Описание:</b> {test.description || '—'}</p>
            <p><b>Разряд:</b> {test.category} | <b>Время:</b> {test.time_limit_seconds} сек | <b>Проходной:</b> {test.passing_score}%</p>
          </Link>
        </Card>
      ))}
    </Space>
  );

  const materialsContent = (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsMaterialModalOpen(true)}>
        Добавить материал
      </Button>
      {materials.map((m) => (
        <Card
          key={m.id}
          title={m.title}
          extra={
            <Popconfirm title="Удалить материал?" onConfirm={() => handleDeleteMaterial(m.id)} okText="Да" cancelText="Нет">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          }
        >
          <p>{m.description}</p>
          <p>Файл: <a href={m.file_url} target="_blank" rel="noopener noreferrer">{m.file_name}</a></p>
        </Card>
      ))}
    </Space>
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={titleStyle}>Курс: {courseTitle}</Title>
      <Tabs defaultActiveKey="tests" items={[
        { key: 'tests', label: 'Тесты', children: testsContent },
        { key: 'materials', label: 'Материалы', children: materialsContent },
      ]} />

      <Modal
        title={editingTest ? 'Редактировать тест' : 'Создать тест'}
        open={isTestModalOpen}
        onOk={handleCreateOrUpdateTest}
        onCancel={() => setIsTestModalOpen(false)}
      >
        <Input placeholder="Название теста" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <Input.TextArea placeholder="Описание" value={testDescription} onChange={(e) => setTestDescription(e.target.value)} style={{ marginBottom: 12 }} />
        <Select value={category} onChange={setCategory} style={{ width: '100%', marginBottom: 12 }}
          options={[
            { value: '1-3', label: 'Младший специалист (1-3 разряд)' },
            { value: '4-5', label: 'Ведущий специалист (4-5 разряд)' },
            { value: '6', label: 'Инженер (6 разряд)' },
          ]} />
        <Input type="number" placeholder="Лимит времени (сек)" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} style={{ marginBottom: 12 }} />
        <Input type="number" placeholder="Проходной балл (%)" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} />
      </Modal>

      <Modal
        title="Добавить материал"
        open={isMaterialModalOpen}
        onOk={handleCreateMaterial}
        onCancel={() => setIsMaterialModalOpen(false)}
      >
        <Input placeholder="Название материала" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <Input.TextArea placeholder="Описание" value={materialDescription} onChange={(e) => setMaterialDescription(e.target.value)} style={{ marginBottom: 12 }} />
        <Upload beforeUpload={(file) => { setFile(file); return false; }} onRemove={() => setFile(null)} maxCount={1}>
          <Button icon={<UploadOutlined />}>Выбрать файл</Button>
        </Upload>
      </Modal>
    </div>
  );
}
