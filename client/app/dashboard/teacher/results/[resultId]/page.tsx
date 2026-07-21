'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
import { Card, Typography, Space, Tag, Button, Descriptions, Collapse } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(0, 86, 185, 0.6), 0 0 2px rgba(0,0,0,0.8)',
  marginBottom: 24,
};

const textStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.9)',
  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
};

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

interface Answer {
  question_id: string;
  given_answer: string | string[];
  is_correct: boolean;
}

export default function ResultDetailPage() {
  const params = useParams();
  const resultId = params.resultId as string;

  const [result, setResult] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    if (resultId && resultId !== 'undefined') {
      fetchResult();
    }
  }, [resultId]);

  const fetchResult = async () => {
    const { data: resultData, error } = await supabase
      .from('test_results')
      .select(`
        *,
        test:test_id ( id, title )
      `)
      .eq('id', resultId)
      .single();

    if (error || !resultData) {
      console.error('Результат не найден:', error);
      return;
    }

    setResult(resultData);
    setAnswers(resultData.answers || []);

    if (resultData.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', resultData.user_id)
        .single();
      setStudentName(profile?.full_name || 'Неизвестно');
    }

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', resultData.test_id);
    setQuestions(questionsData || []);
  };

  if (!result) return <div style={{ padding: 24 }}>Загрузка...</div>;

  const getStatusTag = (status: string) => {
    const color = status === 'passed' ? 'green' : status === 'failed' ? 'red' : 'orange';
    const text = status === 'passed' ? 'Сдал' : status === 'failed' ? 'Не сдал' : 'Время истекло';
    return <Tag color={color}>{text}</Tag>;
  };

  const renderAnswer = (question: Question, answer: Answer | undefined) => {
    if (!answer) return <Text type="secondary">Нет ответа</Text>;
    if (question.question_type === 'single') {
      return <Text>{answer.given_answer as string}</Text>;
    }
    if (question.question_type === 'multiple') {
      return <Text>{(answer.given_answer as string[]).join(', ') || '—'}</Text>;
    }
    return <Text>{answer.given_answer as string}</Text>;
  };

  const renderCorrectAnswer = (question: Question) => {
    if (question.question_type === 'text') return <Text>Требуется ручная проверка</Text>;
    const correct = question.options.filter(opt => opt.isCorrect).map(opt => opt.text).join(', ');
    return <Text style={{ color: 'green' }}>{correct}</Text>;
  };

  const collapseItems = questions.map((q, idx) => {
    const answer = answers.find(a => a.question_id === q.id);
    const isCorrect = answer?.is_correct;
    return {
      key: q.id,
      label: (
        <Space>
          <Text strong style={{ color: '#fff' }}>{idx + 1}. {q.question_text}</Text>
          {answer && (
            <Tag color={isCorrect ? 'green' : 'red'}>
              {isCorrect ? 'Верно' : 'Неверно'}
            </Tag>
          )}
        </Space>
      ),
      children: (
        <div>
          <p><Text strong>Тип вопроса:</Text> {q.question_type === 'single' ? 'Одиночный' : q.question_type === 'multiple' ? 'Множественный' : 'Открытый'}</p>
          <p><Text strong>Ответ ученика:</Text> {renderAnswer(q, answer)}</p>
          <p><Text strong>Правильный ответ:</Text> {renderCorrectAnswer(q)}</p>
          {q.explanation && <p><Text type="secondary">Пояснение: {q.explanation}</Text></p>}
        </div>
      ),
    };
  });

  return (
    <div style={{ padding: 24 }}>
      <Link href="/dashboard/teacher/results">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>Назад к списку</Button>
      </Link>

      <Title level={2} style={titleStyle}>Результат теста</Title>
      <Descriptions bordered column={1} size="middle" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Ученик">{studentName}</Descriptions.Item>
        <Descriptions.Item label="Тест">{result.test?.title}</Descriptions.Item>
        <Descriptions.Item label="Балл">{result.score}/{result.max_score}</Descriptions.Item>
        <Descriptions.Item label="Статус">{getStatusTag(result.status)}</Descriptions.Item>
        <Descriptions.Item label="Завершён">
          {result.finished_at ? new Date(result.finished_at).toLocaleString() : '—'}
        </Descriptions.Item>
      </Descriptions>

      <Title level={3} style={textStyle}>Разбор ответов</Title>
      <Collapse accordion items={collapseItems} />
    </div>
  );
}
