'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button, Space, Typography } from 'antd';

const { Title } = Typography;

const TEST_IDS: Record<string, string> = {
  '1-3': '54360b83-8d0e-490f-a16c-11760994dac9',
  '4-5': '',
  '6': '',
};

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private boss!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private playerHealth = 3;
  private bossHealth = 10;
  private isQuestionActive = false;
  private playerHealthBar!: Phaser.GameObjects.Rectangle;
  private bossHealthBar!: Phaser.GameObjects.Rectangle;
  private coinsEarned = 0;
  private questions: any[] = [];
  private currentQuestionIndex = 0;
  private startTime = 0;
  private testId: string;
  private gift!: Phaser.GameObjects.Rectangle | null;
  private giftOverlapPlayer?: Phaser.Physics.Arcade.Collider;
  private giftOverlapBoss?: Phaser.Physics.Arcade.Collider;

  constructor(testId: string) {
    super({ key: 'GameScene' });
    this.testId = testId;
  }

  preload() {
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
  }

  async create() {
    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 580, 'ground').setScale(2).refreshBody();
    this.platforms.create(400, 380, 'ground');

    // Игрок
    this.player = this.add.rectangle(100, 450, 40, 60, 0x2196f3);
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(40, 60);
    playerBody.setCollideWorldBounds(true);

    // Босс
    this.boss = this.add.rectangle(400, 330, 40, 60, 0xff0000);
    this.physics.add.existing(this.boss);
    const bossBody = this.boss.body as Phaser.Physics.Arcade.Body;
    bossBody.setSize(40, 60);
    bossBody.setCollideWorldBounds(true);
    bossBody.setBounce(0.2);

    // Коллизии
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.boss, this.platforms);
    this.physics.add.collider(this.player, this.boss);

    // Полоски здоровья
    this.playerHealthBar = this.add.rectangle(20, 20, 100, 15, 0x00ff00).setOrigin(0, 0.5);
    this.bossHealthBar = this.add.rectangle(680, 20, 150, 15, 0xff0000).setOrigin(0, 0.5);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.coinsEarned = 0;
    this.startTime = this.time.now;
    this.gift = null;

    // Загружаем вопросы
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', this.testId);
    if (data && data.length > 0) {
      this.questions = Phaser.Utils.Array.Shuffle([...data]);
    } else {
      this.game.events.emit('noQuestions');
      return;
    }

    this.currentQuestionIndex = 0;

    // Таймер подарков: каждые 60 секунд
    this.time.addEvent({
      delay: 60000,
      callback: () => this.spawnGift(),
      loop: true,
    });
  }

  update() {
    if (!this.cursors || this.isQuestionActive) return;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const bossBody = this.boss.body as Phaser.Physics.Arcade.Body;

    // Управление игроком
    if (this.cursors.left.isDown) {
      playerBody.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      playerBody.setVelocityX(160);
    } else {
      playerBody.setVelocityX(0);
    }

    if (this.cursors.up.isDown && playerBody.touching.down) {
      playerBody.setVelocityY(-420); // высокий прыжок
    }

    // Босс идёт к игроку
    const dirToPlayer = this.player.x < this.boss.x ? -1 : 1;
    bossBody.setVelocityX(60 * dirToPlayer);

    // Босс прыгает случайно, когда игрок рядом
    if (bossBody.touching.down && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y) < 200 && Math.random() < 0.02) {
      bossBody.setVelocityY(-420);
    }

    // Встреча с боссом
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
    if (dist < 80 && !this.isQuestionActive && this.currentQuestionIndex < this.questions.length) {
      this.isQuestionActive = true;
      bossBody.setVelocityX(0);
      playerBody.setVelocityX(0);
      this.game.events.emit('question', this.questions[this.currentQuestionIndex]);
    }
  }

  private spawnGift() {
    if (this.gift) return; // уже есть подарок
    const x = Phaser.Math.Between(100, 700);
    this.gift = this.add.rectangle(x, 0, 20, 20, 0xffd700); // золотой
    this.physics.add.existing(this.gift);
    const giftBody = this.gift.body as Phaser.Physics.Arcade.Body;
    giftBody.setCollideWorldBounds(true);
    giftBody.setBounce(0.5);

    // Коллизии с платформами
    this.physics.add.collider(this.gift, this.platforms);

    // Перекрытия с игроком и боссом
    this.giftOverlapPlayer = this.physics.add.overlap(this.player, this.gift, () => {
      if (this.gift) {
        this.playerHealth = Math.min(3, this.playerHealth + 1);
        this.playerHealthBar.width = 100 * (this.playerHealth / 3);
        this.destroyGift();
      }
    });

    this.giftOverlapBoss = this.physics.add.overlap(this.boss, this.gift, () => {
      if (this.gift) {
        // Босс тоже подбирает (но без эффекта, просто убираем подарок)
        this.destroyGift();
      }
    });

    // Автоудаление через 15 секунд
    this.time.delayedCall(15000, () => {
      if (this.gift) this.destroyGift();
    });
  }

  private destroyGift() {
    if (this.gift) {
      this.gift.destroy();
      this.gift = null;
    }
    if (this.giftOverlapPlayer) {
      this.giftOverlapPlayer.destroy();
      this.giftOverlapPlayer = undefined;
    }
    if (this.giftOverlapBoss) {
      this.giftOverlapBoss.destroy();
      this.giftOverlapBoss = undefined;
    }
  }

  public answerQuestion(correct: boolean) {
    const bossBody = this.boss.body as Phaser.Physics.Arcade.Body;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    if (correct) {
      this.bossHealth--;
      this.bossHealthBar.width = 150 * (this.bossHealth / 10);
      this.coinsEarned += 10;
      this.game.events.emit('coinsUpdated', this.coinsEarned);

      // Отбрасываем босса ОТ игрока
      const knockDir = this.boss.x > this.player.x ? 1 : -1;
      bossBody.setVelocityX(250 * knockDir);
      bossBody.setVelocityY(-250);
    } else {
      this.playerHealth--;
      this.playerHealthBar.width = 100 * (this.playerHealth / 3);
      if (this.playerHealth <= 0) {
        this.game.events.emit('playerDied', this.getStats());
        this.scene.stop();
        return;
      }
      // Босс не отскакивает, следующий вопрос сразу
    }

    this.currentQuestionIndex++;

    // Проверка завершения
    if (this.currentQuestionIndex >= this.questions.length || this.bossHealth <= 0) {
      if (this.bossHealth <= 0) {
        this.game.events.emit('bossDefeated', this.coinsEarned, this.getStats());
      } else {
        this.game.events.emit('questionsExhausted', this.getStats());
      }
      this.scene.stop();
      return;
    }

    // Переход к следующему вопросу
    if (correct) {
      // Небольшая пауза перед тем, как снова можно будет задать вопрос
      this.time.delayedCall(500, () => {
        this.isQuestionActive = false;
      });
    } else {
      // Сразу задаём следующий вопрос
      this.isQuestionActive = true;
      this.game.events.emit('question', this.questions[this.currentQuestionIndex]);
    }
  }

  private getStats() {
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    return {
      timeSpent: elapsed,
      questionsAnswered: this.currentQuestionIndex,
      correctAnswers: this.coinsEarned / 10,
      coins: this.coinsEarned,
    };
  }
}

export default function GameComponent() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [timer, setTimer] = useState(20);
  const [showQuestion, setShowQuestion] = useState(false);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [containerVisible, setContainerVisible] = useState(false);
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Запуск игры
  useEffect(() => {
    if (containerVisible && selectedCategory && containerRef.current) {
      const testId = TEST_IDS[selectedCategory];
      if (!testId) return;

      const timer = setTimeout(() => {
        if (gameRef.current) gameRef.current.destroy(true);
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: 'game-container',
          physics: {
            default: 'arcade',
            arcade: { gravity: { x: 0, y: 400 } },
          },
          scene: new GameScene(testId),
        };
        gameRef.current = new Phaser.Game(config);

        const game = gameRef.current;
        game.events.on('question', (q: any) => {
          setQuestion(q);
          setTimer(20);
          setShowQuestion(true);
        });
        game.events.on('coinsUpdated', (newCoins: number) => setCoins(newCoins));
        game.events.on('bossDefeated', async (earnedCoins: number, stats: any) => {
          await saveCoinsAndStats(earnedCoins, stats, 'win');
          setGameResult(`Победа! Заработано ${earnedCoins} монет.`);
          setGameOver(true);
          setStats(stats);
          setContainerVisible(false);
        });
        game.events.on('playerDied', async (stats: any) => {
          await saveGameStats(stats, 'lose');
          setGameResult('Поражение...');
          setGameOver(true);
          setStats(stats);
          setContainerVisible(false);
        });
        game.events.on('questionsExhausted', async (stats: any) => {
          await saveGameStats(stats, 'questions_exhausted');
          setGameResult('Вопросы закончились. Босс устоял.');
          setGameOver(true);
          setStats(stats);
          setContainerVisible(false);
        });
        game.events.on('noQuestions', () => {
          alert('Нет вопросов для этого теста.');
          setContainerVisible(false);
        });
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [containerVisible, selectedCategory]);

  // Таймер обратного отсчёта
  useEffect(() => {
    if (!showQuestion || timer <= 0) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleAnswer(false); // время вышло
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [showQuestion, timer]);

  const startGame = (category: string) => {
    setSelectedCategory(category);
    setGameOver(false);
    setGameResult(null);
    setStats(null);
    setCoins(0);
    setContainerVisible(true);
  };

  const handleAnswer = (correct: boolean) => {
    const scene = gameRef.current?.scene.keys.GameScene as GameScene;
    if (scene) scene.answerQuestion(correct);
    setShowQuestion(false);
  };

  const saveCoinsAndStats = async (coinsAmount: number, stats: any, status: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single();
    const currentCoins = profile?.coins || 0;
    await supabase
      .from('profiles')
      .update({ coins: currentCoins + coinsAmount })
      .eq('id', user.id);

    await supabase.from('game_results').insert({
      user_id: user.id,
      test_id: selectedCategory ? TEST_IDS[selectedCategory] : null,
      score: coinsAmount,
      time_spent: stats.timeSpent,
      questions_answered: stats.questionsAnswered,
      correct_answers: stats.correctAnswers,
      status,
    });
  };

  const saveGameStats = async (stats: any, status: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('game_results').insert({
      user_id: user.id,
      test_id: selectedCategory ? TEST_IDS[selectedCategory] : null,
      score: stats.coins,
      time_spent: stats.timeSpent,
      questions_answered: stats.questionsAnswered,
      correct_answers: stats.correctAnswers,
      status,
    });
  };

  const resetToMenu = () => {
    setSelectedCategory(null);
    setGameOver(false);
    setGameResult(null);
    setStats(null);
    setCoins(0);
    setContainerVisible(false);
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  };

  return (
    <div style={{
      padding: 24,
      color: '#fff',
      textAlign: 'center',
      minHeight: '100vh',
    }}>
      <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>🎮 Сантехник против босса</Title>

      {!selectedCategory && !gameOver && (
        <div>
          <p>Выберите разряд для битвы:</p>
          <Space orientation="vertical" size="large" style={{ marginTop: 16 }}>
            <Button type="primary" size="large" onClick={() => startGame('1-3')} block>
              1-3 разряд (Младший специалист)
            </Button>
            <Button type="primary" size="large" onClick={() => startGame('4-5')} block disabled>
              4-5 разряд (Ведущий специалист) – скоро
            </Button>
            <Button type="primary" size="large" onClick={() => startGame('6')} block disabled>
              6 разряд (Инженер) – скоро
            </Button>
          </Space>
        </div>
      )}

      {gameOver && (
        <div style={{ marginTop: 24 }}>
          <Title level={3} style={{ color: '#ffd700' }}>{gameResult}</Title>
          {stats && (
            <div style={{ marginBottom: 16 }}>
              <p>Время: {stats.timeSpent} сек</p>
              <p>Отвечено вопросов: {stats.questionsAnswered}</p>
              <p>Правильных ответов: {stats.correctAnswers}</p>
              <p>Заработано монет: {stats.coins}</p>
            </div>
          )}
          <Space orientation="vertical" size="middle">
            <Button type="primary" size="large" onClick={() => router.push('/dashboard/student/profile')}>
              Перейти в профиль
            </Button>
            <Button size="large" onClick={resetToMenu}>
              Играть снова
            </Button>
          </Space>
        </div>
      )}

      {selectedCategory && !gameOver && containerVisible && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 18 }}>Разряд: {selectedCategory}</p>
          <p style={{ color: '#ffd700', fontSize: 18 }}>💰 Монет: {coins}</p>
        </div>
      )}

      <div
        ref={containerRef}
        id="game-container"
        style={{
          width: 800,
          height: 600,
          margin: '16px auto 0',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 0 20px rgba(0,86,185,0.5)',
          display: containerVisible ? 'block' : 'none',
        }}
      />

      {showQuestion && question && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#1a1a2e',
          color: '#fff',
          padding: 24,
          borderRadius: 8,
          zIndex: 1000,
          width: 400,
          border: '1px solid #4da8ff',
        }}>
          <p>Осталось времени: {timer} сек</p>
          <p><strong>{question.question_text}</strong></p>
          {question.options.map((opt: any, idx: number) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt.isCorrect)}
              style={{
                display: 'block',
                width: '100%',
                margin: '8px 0',
                padding: 8,
                background: '#0056b9',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {opt.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}