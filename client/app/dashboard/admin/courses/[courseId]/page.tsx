'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import { Button, Card, Modal, Input, Select, message, Space, Typography, Tabs, Upload } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

export default function CourseManagePage() {
  const pathname = usePathname(); // полный путь типа /dashboard/admin/courses/xxx
  // Извлекаем UUID из пути: последний сегмент
  const segments = pathname.split('/');
  const courseId = segments[segments.length - 1]; // это и есть наш UUID

  const [courseTitle, setCourseTitle] = useState('');
  
  // === Тесты ===
  const [tests, setTests] = useState<any[]>([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [category, setCategory] = useState('1-3');
  const [timeLimit, setTimeLimit] = useState(600);
  const [passingScore, setPassingScore] = useState(70);

  // === Материалы ===
  const [materials, setMaterials] = useState<any[]>([]);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!courseId || courseId === 'undefined') return; // защита от битых id
    console.log('Работаем с courseId:', courseId);
    fetchCourse();
    fetchTests();
    fetchMaterials();
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

  const handleCreateTest = async () => {
    const { error } = await supabase.from('tests').insert({
      course_id: courseId,
      title: testTitle,
      description: testDescription,
      category,
      time_limit_seconds: timeLimit,
      passing_score: passingScore,
    });
    if (error) message.error('Ошибка: ' + error.message);
    else {
      message.success('Тест создан!');
      setIsTestModalOpen(false);
      setTestTitle(''); setTestDescription(''); setCategory('1-3'); setTimeLimit(600); setPassingScore(70);
      fetchTests();
    }
  };

  // ------ МАТЕРИАЛЫ ------
  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('course_id', courseId);
    console.log('Загрузка материалов для курса:', courseId, 'результат:', data);
    if (error) {
      console.error('Ошибка загрузки материалов:', error);
    }
    setMaterials(data || []);
  };

  const handleCreateMaterial = async () => {
    if (!file) {
      message.warning('Выберите файл для загрузки');
      return;
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${Date.now()}_${safeFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-materials')
      .upload(fileName, file);

    if (uploadError) {
      message.error('Ошибка загрузки файла: ' + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('course-materials')
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;

    const { error: insertError } = await supabase.from('materials').insert({
      course_id: courseId,
      title: materialTitle || file.name,
      description: materialDescription,
      file_url: fileUrl,
      file_name: file.name,
      file_type: file.name.split('.').pop()?.toLowerCase() || '',
    });

    if (insertError) {
      message.error('Ошибка сохранения: ' + insertError.message);
    } else {
      message.success('Материал добавлен!');
      setIsMaterialModalOpen(false);
      setMaterialTitle(''); setMaterialDescription(''); setFile(null);
      fetchMaterials();
    }
  };

  // Форма для тестов
  const testsContent = (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsTestModalOpen(true)}>
        Добавить тест
      </Button>
      {tests.map((test) => (
        <Link href={`/dashboard/admin/courses/${courseId}/${test.id}`} key={test.id}>
          <Card title={test.title} style={{ cursor: 'pointer' }}>
            <p><b>Описание:</b> {test.description || '—'}</p>
            <p><b>Разряд:</b> {test.category} | <b>Время:</b> {test.time_limit_seconds} сек | <b>Проходной:</b> {test.passing_score}%</p>
          </Card>
        </Link>
      ))}
    </Space>
  );

  // Форма для материалов
  const materialsContent = (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsMaterialModalOpen(true)}>
        Добавить материал
      </Button>
      {materials.map((m) => (
        <Card key={m.id} title={m.title}>
          <p>{m.description}</p>
          <p>Файл: <a href={m.file_url} target="_blank" rel="noopener noreferrer">{m.file_name}</a></p>
        </Card>
      ))}
    </Space>
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Курс: {courseTitle}</Title>
      <Tabs defaultActiveKey="tests" items={[
        { key: 'tests', label: 'Тесты', children: testsContent },
        { key: 'materials', label: 'Материалы', children: materialsContent },
      ]} />

      {/* Модальное окно для создания теста */}
      <Modal
        title="Создать тест"
        open={isTestModalOpen}
        onOk={handleCreateTest}
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

      {/* Модальное окно для добавления материала */}
      <Modal
        title="Добавить материал"
        open={isMaterialModalOpen}
        onOk={handleCreateMaterial}
        onCancel={() => setIsMaterialModalOpen(false)}
      >
        <Input placeholder="Название материала" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <Input.TextArea placeholder="Описание" value={materialDescription} onChange={(e) => setMaterialDescription(e.target.value)} style={{ marginBottom: 12 }} />
        <Upload
          beforeUpload={(file) => { setFile(file); return false; }}
          onRemove={() => setFile(null)}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Выбрать файл</Button>
        </Upload>
      </Modal>
    </div>
  );
}