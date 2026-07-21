'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useParams } from 'next/navigation';
import {
  Button,
  Card,
  Radio,
  Checkbox,
  Space,
  Typography,
  message,
  Progress,
  Input,
  App,
} from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  textShadow: '0 2px 8px rgba(0, 86, 185, 0.6), 0 0 2px rgba(0,0,0,0.8)',
};

const textStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.9)',
  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
};

interface Question {
  id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
  norm_ref: string;
}

interface Answer {
  question_id: string;
  given_answer: string | string[];
  is_correct?: boolean;
}

export default function TakeTestPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const { message } = App.useApp();

  const [loading, setLoading] = useState(true);
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResultId, setTestResultId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (assignmentId && assignmentId !== 'undefined') {
      loadAssignment();
    } else {
      message.error('Некорректный идентификатор теста');
      setLoading(false);
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    const { data: assignment, error: assignError } = await supabase
      .from('assignments')
      .select('id, test_id')
      .eq('id', assignmentId)
      .single();

    if (assignError || !assignment) {
      message.error('Назначение не найдено');
      setLoading(false);
      return;
    }

    const { data: testData, error: testError } = await supabase
      .from('tests')
      .select('id, title, time_limit_seconds, passing_score')
      .eq('id', assignment.test_id)
      .single();

    if (testError || !testData) {
      message.error('Тест не найден');
      setLoading(false);
      return;
    }

    const test = testData;
    setTestTitle(test.title);
    setTimeLeft(test.time_limit_seconds);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      message.error('Вы не авторизованы');
      setLoading(false);
      return;
    }

    // Проверяем существующую попытку
    const { data: existingResult } = await supabase
      .from('test_results')
      .select('id, status, answers, score, max_score')
      .eq('user_id', user.id)
      .eq('test_id', test.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingResult) {
      if (existingResult.status === 'in_progress') {
        setTestResultId(existingResult.id);
        if (existingResult.answers && Array.isArray(existingResult.answers)) {
          setAnswers(existingResult.answers);
        }
      } else {
        setTestResultId(existingResult.id);
        setScore(existingResult.score || 0);
        setMaxScore(existingResult.max_score || 0);
        setStatus(existingResult.status);
        setIsFinished(true);
        setLoading(false);
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('test_id', test.id);
        if (questionsData) setQuestions(questionsData);
        return;
      }
    } else {
      const { data: newResult, error: insertError } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          test_id: test.id,
          status: 'in_progress',
          answers: [],
          score: 0,
          max_score: 0,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Ошибка создания попытки:', insertError);
        message.error('Не удалось начать тест');
        setLoading(false);
        return;
      }

      setTestResultId(newResult.id);
    }

    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', test.id);

    if (questionsData) {
      setQuestions(questionsData);
      if (answers.length === 0) {
        setAnswers(
          questionsData.map((q) => ({
            question_id: q.id,
            given_answer: q.question_type === 'multiple' ? [] : '',
          }))
        );
      }
      setMaxScore(questionsData.length);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isFinished || timeLeft <= 0 || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, timeLeft, loading]);

  const updateAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.question_id === questionId ? { ...a, given_answer: value } : a
      )
    );
  };

  const handleSingleChoice = (questionId: string, optionText: string) => {
    updateAnswer(questionId, optionText);
  };

  const handleMultipleChoice = (
    questionId: string,
    optionText: string,
    checked: boolean
  ) => {
    const answer = answers.find((a) => a.question_id === questionId);
    const currentAnswers = Array.isArray(answer?.given_answer)
      ? [...answer.given_answer]
      : [];
    if (checked) {
      currentAnswers.push(optionText);
    } else {
      const index = currentAnswers.indexOf(optionText);
      if (index > -1) currentAnswers.splice(index, 1);
    }
    updateAnswer(questionId, currentAnswers);
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    updateAnswer(questionId, text);
  };

  const handleFinishTest = async (timeout = false) => {
    if (isFinished) return;

    let correctCount = 0;
    const evaluatedAnswers: Answer[] = answers.map((ans, idx) => {
      const question = questions[idx];
      let isCorrect = false;

      if (question.question_type === 'single') {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        isCorrect = ans.given_answer === correctOption?.text;
      } else if (question.question_type === 'multiple') {
        const correctOptions = question.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.text)
          .sort();
        const given = Array.isArray(ans.given_answer)
          ? [...ans.given_answer].sort()
          : [];
        isCorrect =
          JSON.stringify(correctOptions) === JSON.stringify(given);
      }
      if (isCorrect) correctCount++;
      return { ...ans, is_correct: isCorrect };
    });

    const finalScore = correctCount;
    const finalStatus = timeout
      ? 'timeout'
      : finalScore >= Math.ceil(maxScore * 0.7)
      ? 'passed'
      : 'failed';

    setScore(finalScore);
    setMaxScore(maxScore);
    setStatus(finalStatus);
    setIsFinished(true);

    if (testResultId) {
      const { error: updateError } = await supabase
        .from('test_results')
        .update({
          finished_at: new Date().toISOString(),
          score: finalScore,
          max_score: maxScore,
          status: finalStatus,
          answers: evaluatedAnswers,
        })
        .eq('id', testResultId);

      if (updateError) {
        console.error('Ошибка при сохранении результата:', updateError);
        message.error('Результат не был сохранён');
      }
    } else {
      console.error('testResultId не установлен – результат некуда сохранять');
      message.error('Критическая ошибка: результат не сохранён');
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#fff' }}>Загрузка теста...</div>;

  if (isFinished) {
    return (
      <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
        <Title level={2} style={titleStyle}>{testTitle} — Результат</Title>
        <Progress
          percent={Math.round((score / maxScore) * 100)}
          format={() => `${score}/${maxScore}`}
        />
        <Text strong style={{ display: 'block', marginTop: 16, ...textStyle }}>
          Статус:{' '}
          {status === 'passed'
            ? 'Сдал'
            : status === 'timeout'
            ? 'Время истекло'
            : 'Не сдал'}
        </Text>

        <div style={{ marginTop: 24 }}>
          <Title level={4} style={textStyle}>Разбор ответов</Title>
          {questions.map((q, idx) => {
            const ans = answers[idx];
            const correct = ans?.is_correct;
            return (
              <Card key={q.id} style={{ marginBottom: 12 }}>
                <Text strong>
                  {idx + 1}. {q.question_text}
                </Text>
                <div style={{ marginTop: 8 }}>
                  {q.question_type === 'single' && (
                    <p>
                      Ваш ответ: {ans?.given_answer || '—'}{' '}
                      {correct ? '✓' : '✗'}
                    </p>
                  )}
                  {q.question_type === 'multiple' && (
                    <p>
                      Ваш ответ:{' '}
                      {Array.isArray(ans?.given_answer)
                        ? ans.given_answer.join(', ') || '—'
                        : '—'}{' '}
                      {correct ? '✓' : '✗'}
                    </p>
                  )}
                  {q.question_type === 'text' && (
                    <p>Ваш ответ: {ans?.given_answer || '—'}</p>
                  )}
                  {!correct && (
                    <p style={{ color: 'green' }}>
                      Правильный ответ:{' '}
                      {q.options
                        ?.filter((opt) => opt.isCorrect)
                        .map((opt) => opt.text)
                        .join(', ')}
                    </p>
                  )}
                  {q.explanation && (
                    <p>
                      <i>Пояснение: {q.explanation}</i>
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={3} style={titleStyle}>{testTitle}</Title>
        <Space>
          <ClockCircleOutlined style={{ color: '#fff' }} />
          <Text strong style={textStyle}>
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </Text>
        </Space>
      </div>
      <Progress
        percent={Math.round(
          ((currentQuestionIndex + 1) / questions.length) * 100
        )}
        format={() => `${currentQuestionIndex + 1}/${questions.length}`}
      />

      <Card key={currentQuestion.id} style={{ marginTop: 24 }}>
        <Title level={4}>
          {currentQuestionIndex + 1}. {currentQuestion.question_text}
        </Title>

        {currentQuestion.question_type === 'single' && (
          <Radio.Group
            value={currentAnswer?.given_answer as string}
            onChange={(e) =>
              handleSingleChoice(currentQuestion.id, e.target.value)
            }
          >
            <Space orientation="vertical">
              {currentQuestion.options?.map((opt, i) => (
                <Radio key={i} value={opt.text}>
                  {opt.text}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        )}

        {currentQuestion.question_type === 'multiple' && (
          <Checkbox.Group
            value={
              Array.isArray(currentAnswer?.given_answer)
                ? currentAnswer.given_answer
                : []
            }
            onChange={(checkedValues) =>
              updateAnswer(currentQuestion.id, checkedValues as string[])
            }
          >
            <Space orientation="vertical">
              {currentQuestion.options?.map((opt, i) => (
                <Checkbox key={i} value={opt.text}>
                  {opt.text}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        )}

        {currentQuestion.question_type === 'text' && (
          <Input.TextArea
            rows={3}
            value={currentAnswer?.given_answer as string}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleTextAnswer(currentQuestion.id, e.target.value)
            }
            placeholder="Введите ответ..."
          />
        )}
      </Card>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 24,
        }}
      >
        <Button
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
        >
          Предыдущий
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            type="primary"
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
          >
            Следующий
          </Button>
        ) : (
          <Button type="primary" danger onClick={() => handleFinishTest(false)}>
            Завершить тест
          </Button>
        )}
      </div>
    </div>
  );
}