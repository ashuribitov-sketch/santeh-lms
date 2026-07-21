'use client';

import { supabase } from '@/utils/supabase/client';
import { Button, Layout, Menu, Space, Typography } from 'antd';
import { LogoutOutlined, UserOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Content } = Layout;

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const menuItems = [
    {
      key: '/dashboard/teacher/assign',
      icon: <PlusOutlined />,
      label: <Link href="/dashboard/teacher/assign">Назначить тест</Link>,
    },
    {
      key: '/dashboard/teacher/results',
      icon: <BarChartOutlined />,
      label: <Link href="/dashboard/teacher/results">Результаты</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard/teacher" style={{ textDecoration: 'none', color: '#1677ff' }}>
            <Typography.Title level={4} style={{ margin: 0 }}>🛠️ Грамотный сантехник</Typography.Title>
          </Link>
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menuItems}
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>
        <Space>
          <Button icon={<UserOutlined />} type="text">Профиль</Button>
          <Button icon={<LogoutOutlined />} type="text" onClick={handleSignOut}>Выйти</Button>
        </Space>
      </Header>
      <Content style={{ padding: 24, background: '#f5f5f5' }}>
        {children}
      </Content>
    </Layout>
  );
}