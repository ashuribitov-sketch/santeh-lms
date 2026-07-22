'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle | Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private useSprite = true;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');

    this.load.once('loaderror', (fileObj: any) => {
      if (fileObj.key === 'player') {
        console.warn('Спрайт игрока не загрузился, будет использован прямоугольник');
        this.useSprite = false;
      }
    });
  }

  create() {
    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.staticGroup();
    if (this.textures.exists('ground')) {
      this.platforms.create(400, 580, 'ground').setScale(2).refreshBody();
      this.platforms.create(200, 400, 'ground');
      this.platforms.create(600, 300, 'ground');
    } else {
      this.platforms.add(this.add.rectangle(400, 580, 800, 40, 0x4caf50));
      this.platforms.add(this.add.rectangle(200, 400, 200, 40, 0x4caf50));
      this.platforms.add(this.add.rectangle(600, 300, 200, 40, 0x4caf50));
    }

    if (this.useSprite && this.textures.exists('player')) {
      this.player = this.physics.add.sprite(100, 450, 'player');
      (this.player as Phaser.Physics.Arcade.Sprite).setBounce(0.2);
      (this.player as Phaser.Physics.Arcade.Sprite).setCollideWorldBounds(true);
      (this.player as Phaser.Physics.Arcade.Sprite).setSize(20, 40);

      if (!this.anims.exists('walk')) {
        this.anims.create({
          key: 'walk',
          frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1,
        });
      }
      if (!this.anims.exists('jump')) {
        this.anims.create({
          key: 'jump',
          frames: [{ key: 'player', frame: 4 }],
          frameRate: 10,
          repeat: 0,
        });
      }
    } else {
      this.useSprite = false;
      this.player = this.add.rectangle(100, 450, 40, 60, 0x2196f3);
      this.physics.add.existing(this.player);
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setSize(40, 60);
      body.setCollideWorldBounds(true);
    }

    this.physics.add.collider(this.player, this.platforms);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
  }

  update() {
    if (!this.cursors) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const isJumping = !body.touching.down;

    if (this.cursors.left.isDown) {
      body.setVelocityX(-160);
      if (this.useSprite && (this.player as Phaser.Physics.Arcade.Sprite).anims?.exists('walk')) {
        (this.player as Phaser.Physics.Arcade.Sprite).setFlipX(true);
        if (!isJumping) (this.player as Phaser.Physics.Arcade.Sprite).anims.play('walk', true);
      }
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(160);
      if (this.useSprite && (this.player as Phaser.Physics.Arcade.Sprite).anims?.exists('walk')) {
        (this.player as Phaser.Physics.Arcade.Sprite).setFlipX(false);
        if (!isJumping) (this.player as Phaser.Physics.Arcade.Sprite).anims.play('walk', true);
      }
    } else {
      body.setVelocityX(0);
      if (this.useSprite && (this.player as Phaser.Physics.Arcade.Sprite).anims) {
        (this.player as Phaser.Physics.Arcade.Sprite).anims.stop();
        (this.player as Phaser.Physics.Arcade.Sprite).setFrame(0);
      }
    }

    if (this.cursors.up.isDown && body.touching.down) {
      body.setVelocityY(-330);
      if (this.useSprite && (this.player as Phaser.Physics.Arcade.Sprite).anims?.exists('jump')) {
        (this.player as Phaser.Physics.Arcade.Sprite).anims.play('jump');
      }
    }
  }
}

export default function GameComponent() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 400 } },
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