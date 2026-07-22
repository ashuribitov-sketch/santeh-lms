'use client';

import { useState, useEffect } from 'react';
import { Spin } from 'antd';

export default function GamePage() {
  // Состояние для компонента игры – изначально null (ничего не импортируем)
  const [GameComponent, setGameComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Динамический импорт модуля ТОЛЬКО на клиенте
    import('./GameComponent').then((mod) => {
      setGameComponent(() => mod.default);
    });
  }, []);

  // Пока компонент не загружен (в том числе на сервере) показываем прелоадер
  if (!GameComponent) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 50%, #0056b9 0%, #0a0f1e 70%)',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // На клиенте, когда модуль загружен, рендерим игру
  return <GameComponent />;
}