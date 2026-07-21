'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
import { Button, Card, Modal, Input, Select, message, Space, Typography, Radio, Checkbox, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(0, 86, 185, 0.6), 0 0 2px rgba(0,0,0,0.8)',
  marginBottom: 24,
};

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  options: Option[];
  explanation: string;
  norm_ref: string;
}

export default function TestQuestionsPage() {
  const params = useParams();
  const testId = params.testId as string;

  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'single' | 'multiple' | 'text'>('single');
  const [options, setOptions] = useState<Option[]>([]);
  const [explanation, setExplanation] = useState('');
  const [normRef, setNormRef] = useState('');

  useEffect(() => {
    if (testId && testId !== 'undefined' && testId.length > 10) {
      fetchTest();
      fetchQuestions();
    }
  }, [testId]);

  const fetchTest = async () => {
    const { data } = await supabase.from('tests').select('title').eq('id', testId).maybeSingle();
    if (data) setTestTitle(data.title);
    else message.error('Тест не найден');
  };

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*').eq('test_id', testId);
    setQuestions(data || []);
  };

  const resetForm = () => {
    setQuestionText('');
    setQuestionType('single');
    setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    setExplanation('');
    setNormRef('');
    setEditingQuestion(null);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setQuestionText(question.question_text);
    setQuestionType(question.question_type);
    setOptions(question.options?.length ? question.options : [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    setExplanation(question.explanation || '');
    setNormRef(question.norm_ref || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) message.error('Ошибка: ' + error.message);
    else { message.success('Вопрос удалён!'); fetchQuestions(); }
  };

  const addOption = () => setOptions([...options, { text: '', isCorrect: false }]);
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  const updateOptionText = (index: number, text: string) => { const newOpts = [...options]; newOpts[index].text = text; setOptions(newOpts); };
  const updateOptionCorrect = (index: number, isCorrect: boolean) => {
    const newOpts = [...options];
    if (questionType === 'single' && isCorrect) newOpts.forEach((opt, i) => { opt.isCorrect = i === index; });
    else newOpts[index].isCorrect = isCorrect;
    setOptions(newOpts);
  };

  const handleCreateOrUpdate = async () => {
    if (!testId) { message.error('Не удалось определить тест'); return; }

    const payload = {
      test_id: testId,
      question_text: questionText,
      question_type: questionType,
      options: questionType !== 'text' ? options : null,
      explanation,
      norm_ref: normRef,
    };

    let error = null;
    if (editingQuestion) {
      ({ error } = await supabase.from('questions').update(payload).eq('id', editingQuestion.id));
    } else {
      ({ error } = await supabase.from('questions').insert(payload));
    }

    if (error) message.error('Ошибка: ' + error.message);
    else {
      message.success(editingQuestion ? 'Вопрос обновлён!' : 'Вопрос создан!');
      setIsModalOpen(false);
      resetForm();
      fetchQuestions();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={titleStyle}>Тест: {testTitle}</Title>
      <Title level={3} style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)', marginTop: 0 }}>Вопросы</Title>

      <Space orientation="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { resetForm(); setIsModalOpen(true); }}>
          Добавить вопрос
        </Button>

        {questions.map((q, index) => (
          <Card
            key={q.id}
            title={`Вопрос ${index + 1}`}
            extra={
              <Space>
                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(q)} />
                <Popconfirm title="Удалить вопрос?" onConfirm={() => handleDelete(q.id)} okText="Да" cancelText="Нет">
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            }
          >
            <p><b>Текст:</b> {q.question_text}</p>
            <p><b>Тип:</b> {q.question_type === 'single' ? 'Одиночный' : q.question_type === 'multiple' ? 'Множественный' : 'Открытый'}</p>
            {q.options && (
              <ul>
                {q.options.map((opt, i) => (
                  <li key={i} style={{ color: opt.isCorrect ? 'green' : 'inherit' }}>{opt.text} {opt.isCorrect ? '✓' : ''}</li>
                ))}
              </ul>
            )}
            {q.norm_ref && <p><b>Норматив:</b> {q.norm_ref}</p>}
          </Card>
        ))}
      </Space>

      <Modal
        title={editingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}
        open={isModalOpen}
        onOk={handleCreateOrUpdate}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Input.TextArea placeholder="Текст вопроса" value={questionText} onChange={(e) => setQuestionText(e.target.value)} style={{ marginBottom: 12 }} rows={3} />
        <Select value={questionType} onChange={setQuestionType} style={{ width: '100%', marginBottom: 12 }}
          options={[
            { value: 'single', label: 'Одиночный выбор' },
            { value: 'multiple', label: 'Множественный выбор' },
            { value: 'text', label: 'Открытый ответ' },
          ]} />

        {questionType !== 'text' && (
          <>
            <Title level={5}>Варианты ответов</Title>
            {options.map((opt, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Input placeholder={`Вариант ${index + 1}`} value={opt.text} onChange={(e) => updateOptionText(index, e.target.value)} style={{ width: 400 }} />
                {questionType === 'single' ? (
                  <Radio checked={opt.isCorrect} onChange={(e) => updateOptionCorrect(index, e.target.checked)} />
                ) : (
                  <Checkbox checked={opt.isCorrect} onChange={(e) => updateOptionCorrect(index, e.target.checked)} />
                )}
                <Button danger onClick={() => removeOption(index)}>Удалить</Button>
              </Space>
            ))}
            <Button type="dashed" onClick={addOption} style={{ marginTop: 8 }}>Добавить вариант</Button>
          </>
        )}

        <Input placeholder="Пояснение" value={explanation} onChange={(e) => setExplanation(e.target.value)} style={{ marginTop: 12, marginBottom: 12 }} />
        <Input placeholder="Ссылка на норматив" value={normRef} onChange={(e) => setNormRef(e.target.value)} />
      </Modal>
    </div>
  );
}

// Обязательно для статического экспорта
export async function generateStaticParams() {
  return [];
}