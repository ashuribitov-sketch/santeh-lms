'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';
import { Button, Card, Modal, Input, Select, message, Space, Typography, Radio, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

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
  const pathname = usePathname();
  const segments = pathname.split('/');
  const testId = segments[segments.length - 1];

  const [testExists, setTestExists] = useState<boolean | null>(null); // null = загрузка
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'single' | 'multiple' | 'text'>('single');
  const [options, setOptions] = useState<Option[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [explanation, setExplanation] = useState('');
  const [normRef, setNormRef] = useState('');

  useEffect(() => {
    if (!testId || testId === 'undefined' || testId.length < 10) {
      message.error('Некорректный идентификатор теста');
      setTestExists(false);
      return;
    }
    console.log('Текущий testId:', testId);
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    const { data, error } = await supabase
      .from('tests')
      .select('id, title')
      .eq('id', testId)
      .maybeSingle(); // вернёт null, если не найдено, без ошибки 406

    if (error || !data) {
      console.error('Тест не найден:', error);
      message.error('Тест не найден. Возможно, он был удалён.');
      setTestExists(false);
      return;
    }

    setTestTitle(data.title);
    setTestExists(true);
    fetchQuestions();
  };

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*').eq('test_id', testId);
    setQuestions(data || []);
  };

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const updateOptionCorrect = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];
    if (questionType === 'single' && isCorrect) {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index].isCorrect = isCorrect;
    }
    setOptions(newOptions);
  };

  const handleCreateQuestion = async () => {
    if (!testId) {
      message.error('Не удалось определить тест');
      return;
    }

    const { error } = await supabase.from('questions').insert({
      test_id: testId,
      question_text: questionText,
      question_type: questionType,
      options: questionType !== 'text' ? options : null,
      explanation,
      norm_ref: normRef,
    });

    if (error) {
      message.error('Ошибка: ' + error.message);
    } else {
      message.success('Вопрос создан!');
      setIsModalOpen(false);
      setQuestionText('');
      setQuestionType('single');
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setExplanation('');
      setNormRef('');
      fetchQuestions();
    }
  };

  // Пока идёт проверка существования теста
  if (testExists === null) {
    return <div style={{ padding: 24 }}>Проверка теста...</div>;
  }

  // Тест не существует – показываем сообщение
  if (testExists === false) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={2}>Тест не найден</Title>
        <p>Возможно, он был удалён или ссылка некорректна.</p>
        <Button onClick={() => window.history.back()}>Вернуться назад</Button>
      </div>
    );
  }

  // Тест существует – отображаем редактор вопросов
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Тест: {testTitle}</Title>
      <Title level={3} style={{ marginTop: 0 }}>Вопросы</Title>

      <Space orientation="vertical" size="large" style={{ width: '100%', marginTop: 20 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Добавить вопрос
        </Button>

        {questions.map((q, index) => (
          <Card key={q.id} title={`Вопрос ${index + 1}`} style={{ width: '100%' }}>
            <p><b>Текст:</b> {q.question_text}</p>
            <p><b>Тип:</b> {q.question_type === 'single' ? 'Одиночный выбор' : q.question_type === 'multiple' ? 'Множественный выбор' : 'Открытый ответ'}</p>
            {q.options && (
              <ul>
                {q.options.map((opt: Option, i: number) => (
                  <li key={i} style={{ color: opt.isCorrect ? 'green' : 'inherit' }}>
                    {opt.text} {opt.isCorrect ? '✓' : ''}
                  </li>
                ))}
              </ul>
            )}
            {q.norm_ref && <p><b>Норматив:</b> {q.norm_ref}</p>}
          </Card>
        ))}
      </Space>

      <Modal
        title="Добавить вопрос"
        open={isModalOpen}
        onOk={handleCreateQuestion}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Input.TextArea
          placeholder="Текст вопроса"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          style={{ marginBottom: 12 }}
          rows={3}
        />
        <Select
          value={questionType}
          onChange={setQuestionType}
          style={{ width: '100%', marginBottom: 12 }}
          options={[
            { value: 'single', label: 'Одиночный выбор' },
            { value: 'multiple', label: 'Множественный выбор' },
            { value: 'text', label: 'Открытый ответ' },
          ]}
        />

        {questionType !== 'text' && (
          <>
            <Title level={5}>Варианты ответов</Title>
            {options.map((opt, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Input
                  placeholder={`Вариант ${index + 1}`}
                  value={opt.text}
                  onChange={(e) => updateOptionText(index, e.target.value)}
                  style={{ width: 400 }}
                />
                {questionType === 'single' ? (
                  <Radio
                    checked={opt.isCorrect}
                    onChange={(e) => updateOptionCorrect(index, e.target.checked)}
                  />
                ) : (
                  <Checkbox
                    checked={opt.isCorrect}
                    onChange={(e) => updateOptionCorrect(index, e.target.checked)}
                  />
                )}
                <Button danger onClick={() => removeOption(index)}>Удалить</Button>
              </Space>
            ))}
            <Button type="dashed" onClick={addOption} style={{ marginTop: 8 }}>
              Добавить вариант
            </Button>
          </>
        )}

        <Input
          placeholder="Пояснение к правильному ответу"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          style={{ marginTop: 12, marginBottom: 12 }}
        />
        <Input
          placeholder="Ссылка на норматив (СНиП/СП)"
          value={normRef}
          onChange={(e) => setNormRef(e.target.value)}
        />
      </Modal>
    </div>
  );
}