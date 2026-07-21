'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Form, Input, Typography, App } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const { message } = App.useApp();

  const onFinish = async (values: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: 'student',
        },
      },
    });

    if (error) {
      message.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      router.push('/dashboard/student');
    }
    setLoading(false);
  };

  // Если роль не student — не показываем форму (это для безопасности)
  if (role !== 'student') return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e6f0ff 0%, #b3d4ff 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          borderRadius: 12,
        }}
        bodyStyle={{ padding: '32px 24px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>🧑‍🔧</span>
          <Title level={3} style={{ margin: '16px 0 8px' }}>
            Регистрация ученика
          </Title>
          <Text type="secondary">Создайте аккаунт для обучения</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Введите ваше ФИО' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="ФИО" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 6, message: 'Минимум 6 символов' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Уже есть аккаунт? <Link href="/auth/login">Войти</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>}>
      <RegisterForm />
    </Suspense>
  );
}