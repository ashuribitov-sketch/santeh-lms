'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Здесь пока ничего не грузим, используем примитивы
  }

  create() {
    // Фон
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Платформа (пол)
    this.add.rectangle(400, 580, 800, 40, 0x4caf50);

    // Персонаж (синий прямоугольник)
    this.player = this.add.rectangle(400, 540, 40, 60, 0x2196f3);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Управление
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
  }

  update() {
    if (!this.cursors) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.cursors.left.isDown) {
      body.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(200);
    } else {
      body.setVelocityX(0);
    }
  }
}

export default function GamePage() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 300 },
        },
      },
      scene: [GameScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: 16 }}>🎮 Игра: Сантехник против босса</h1>
      <div
        id="game-container"
        style={{
          width: 800,
          height: 600,
          margin: '0 auto',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0,86,185,0.5)',
        }}
      />
    </div>
  );
}