'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Form, Input, Typography, App } from 'antd';
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

  if (role !== 'student') return null;

  return (
    <div style={styles.container}>
      <div style={styles.floatingElements}>
        <span style={{ ...styles.floatingIcon, top: '10%', left: '5%', fontSize: 80, opacity: 0.6 }}>🔧</span>
        <span style={{ ...styles.floatingIcon, top: '20%', right: '8%', fontSize: 60, opacity: 0.5 }}>🔩</span>
        <span style={{ ...styles.floatingIcon, bottom: '15%', left: '10%', fontSize: 70, opacity: 0.4 }}>🛠️</span>
        <span style={{ ...styles.floatingIcon, bottom: '25%', right: '5%', fontSize: 90, opacity: 0.55 }}>⚙️</span>
        <span style={{ ...styles.floatingIcon, top: '40%', left: '3%', fontSize: 50, opacity: 0.35 }}>🔧</span>
        <span style={{ ...styles.floatingIcon, top: '35%', right: '15%', fontSize: 75, opacity: 0.45 }}>🔩</span>
      </div>

      <div style={styles.gridOverlay} />

      <div style={styles.cardWrapper}>
        <Title level={2} style={styles.mainTitle}>
          Стань профессионалом
        </Title>
        <Text style={styles.subTitle}>
          Обучение сантехнике от теории к практике
        </Text>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.logoIcon}>🧑‍🔧</span>
            <Title level={3} style={styles.cardTitle}>Регистрация ученика</Title>
            <Text style={styles.cardSubtitle}>Создайте аккаунт для обучения</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="fullName"
              rules={[{ required: true, message: 'Введите ваше ФИО' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
                placeholder="ФИО"
                style={styles.input}
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Некорректный email' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
                placeholder="Email"
                style={styles.input}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 6, message: 'Минимум 6 символов' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
                placeholder="Пароль"
                style={styles.input}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={styles.button}
              >
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" style={{ color: '#4da8ff' }}>
                Войти
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Загрузка...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

// Те же стили, что и на странице входа
const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 50%, #0056b9 0%, #0a0f1e 70%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 24,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  floatingIcon: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.15)',
    filter: 'drop-shadow(0 0 8px rgba(0,86,185,0.5))',
    userSelect: 'none',
  },
  cardWrapper: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 460,
    width: '100%',
    textAlign: 'center',
  },
  mainTitle: {
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 28,
    marginBottom: 8,
    textShadow: '0 2px 10px rgba(0,86,185,0.5)',
  },
  subTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 32,
    display: 'block',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 16,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0,86,185,0.3)',
    padding: '40px 32px',
    textAlign: 'left',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 48,
    display: 'block',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#ffffff',
    fontWeight: 600,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.7)',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    borderRadius: 8,
    transition: 'all 0.3s ease',
  },
  button: {
    background: 'linear-gradient(180deg, #0056b9 0%, #003d80 100%)',
    border: 'none',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,86,185,0.4), 0 2px 4px rgba(0,0,0,0.3)',
    fontWeight: 600,
    fontSize: 16,
    height: 48,
    transition: 'all 0.2s ease',
    marginTop: 8,
  },
};