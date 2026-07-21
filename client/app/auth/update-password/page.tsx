'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button, Card, Form, Input, Typography, App } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  // При загрузке страницы проверяем, есть ли сессия с токеном сброса
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        message.error('Недействительная или истекшая ссылка сброса пароля');
        router.push('/auth/login');
      }
    };
    checkSession();
  }, []);

  const onFinish = async (values: { password: string }) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success('Пароль успешно обновлён! Сейчас вы будете перенаправлены на вход.');
      await supabase.auth.signOut(); // выходим, чтобы пользователь заново вошёл с новым паролем
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.gridOverlay} />
      <div style={styles.floatingElements}>
        <span style={{ ...styles.floatingIcon, top: '10%', left: '5%', fontSize: 80, opacity: 0.6 }}>🔧</span>
        <span style={{ ...styles.floatingIcon, top: '20%', right: '8%', fontSize: 60, opacity: 0.5 }}>🔩</span>
        <span style={{ ...styles.floatingIcon, bottom: '15%', left: '10%', fontSize: 70, opacity: 0.4 }}>🛠️</span>
        <span style={{ ...styles.floatingIcon, bottom: '25%', right: '5%', fontSize: 90, opacity: 0.55 }}>⚙️</span>
      </div>

      <div style={styles.cardWrapper}>
        <Title level={2} style={styles.mainTitle}>Новый пароль</Title>
        <Card style={styles.card} styles={{ body: { padding: '32px 24px' } }}>
          <div style={styles.cardHeader}>
            <span style={styles.logoIcon}>🔒</span>
            <Title level={3} style={styles.cardTitle}>Установите новый пароль</Title>
            <Text style={styles.cardSubtitle}>Минимум 6 символов</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Введите новый пароль' },
                { min: 6, message: 'Минимум 6 символов' },
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />} placeholder="Новый пароль" style={styles.input} />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Подтвердите пароль' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Пароли не совпадают'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />} placeholder="Подтвердите пароль" style={styles.input} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block style={styles.button}>
                Сохранить пароль
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

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
    opacity: 0.4,
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
    marginBottom: 24,
    textShadow: '0 2px 10px rgba(0,86,185,0.5)',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 16,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0,86,185,0.3)',
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
  },
  button: {
    background: 'linear-gradient(180deg, #0056b9 0%, #003d80 100%)',
    border: 'none',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,86,185,0.4), 0 2px 4px rgba(0,0,0,0.3)',
    fontWeight: 600,
    fontSize: 16,
    height: 48,
  },
};