'use client';

import { supabase } from '@/utils/supabase/client';
import { Button, Layout, Menu, Space, Typography } from 'antd';
import { LogoutOutlined, UserOutlined, BookOutlined, ThunderboltOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Content } = Layout;

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const menuItems = [
    {
      key: '/dashboard/student',
      icon: <BookOutlined />,
      label: <Link href="/dashboard/student">Мои тесты</Link>,
    },
    {
      key: '/dashboard/student/game',
      icon: <ThunderboltOutlined />,
      label: <Link href="/dashboard/student/game">Игра</Link>,
    },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.gridOverlay} />
      <div style={styles.floatingElements}>
        <span style={{ ...styles.floatingIcon, top: '5%', left: '2%', fontSize: 40, opacity: 0.3 }}>🔧</span>
        <span style={{ ...styles.floatingIcon, bottom: '10%', right: '3%', fontSize: 50, opacity: 0.25 }}>🔩</span>
        <span style={{ ...styles.floatingIcon, top: '30%', right: '5%', fontSize: 35, opacity: 0.2 }}>🛠️</span>
        <span style={{ ...styles.floatingIcon, bottom: '20%', left: '4%', fontSize: 45, opacity: 0.25 }}>⚙️</span>
      </div>

      <Layout style={{ background: 'transparent', minHeight: '100vh' }}>
        <Header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/dashboard/student" style={{ textDecoration: 'none', color: '#4da8ff' }}>
              <Typography.Title level={4} style={{ margin: 0, color: '#fff' }}>
                🛠️ Академия Сантехники
              </Typography.Title>
            </Link>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[pathname]}
              items={menuItems}
              style={{ background: 'transparent', borderBottom: 'none' }}
            />
          </div>
          <Space>
            <Link href="/dashboard/student/profile">
              <Button icon={<UserOutlined />} type="text" style={{ color: '#fff' }}>Профиль</Button>
            </Link>
            <Button icon={<LogoutOutlined />} type="text" style={{ color: '#fff' }} onClick={handleSignOut}>Выйти</Button>
          </Space>
        </Header>
        <Content style={{ padding: 24, position: 'relative', zIndex: 1 }}>
          {children}
        </Content>
      </Layout>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 50%, #0056b9 0%, #0a0f1e 70%)',
    overflow: 'hidden',
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
    zIndex: 0,
  },
  floatingIcon: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.1)',
    filter: 'drop-shadow(0 0 6px rgba(0,86,185,0.4))',
  },
};