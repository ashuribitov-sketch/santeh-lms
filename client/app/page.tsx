import Link from 'next/link';

export default function HomePage() {
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
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <span style={{ fontSize: 64 }}>🛠️</span>
        <h1 style={{ fontSize: 32, marginBottom: 8, color: '#1677ff' }}>
          Грамотный сантехник
        </h1>
        <p style={{ fontSize: 16, color: '#555', marginBottom: 40 }}>
          Платформа обучения и аттестации специалистов
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/auth/register?role=student">
            <button
              style={{
                width: '100%',
                padding: '16px 0',
                fontSize: 18,
                background: '#1677ff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              🧑‍🔧 Регистрация ученика
            </button>
          </Link>
          <Link href="/auth/login">
            <button
              style={{
                width: '100%',
                padding: '16px 0',
                fontSize: 18,
                background: '#fff',
                color: '#1677ff',
                border: '1px solid #1677ff',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              🔑 Вход для ученика
            </button>
          </Link>
          <Link href="/auth/login">
            <button
              style={{
                width: '100%',
                padding: '16px 0',
                fontSize: 18,
                background: '#fff',
                color: '#1677ff',
                border: '1px solid #1677ff',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              👨‍🏫 Вход для педагога
            </button>
          </Link>
          <Link href="/auth/login">
            <button
              style={{
                width: '100%',
                padding: '16px 0',
                fontSize: 18,
                background: '#fff',
                color: '#1677ff',
                border: '1px solid #1677ff',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              ⚙️ Вход для администратора
            </button>
          </Link>
        </div>
        <p style={{ marginTop: 32, color: '#888', fontSize: 14 }}>
          Педагоги и администраторы получают доступ после создания учётной записи администратором.
        </p>
      </div>
    </div>
  );
}