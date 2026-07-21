'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

const GameComponent = dynamic(() => import('./GameComponent'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 50%, #0056b9 0%, #0a0f1e 70%)',
    }}>
      <Spin size="large" />
    </div>
  ),
});

export default function GamePage() {
  return <GameComponent />;
}