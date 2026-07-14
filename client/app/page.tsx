import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
      <h1>Платформа «Грамотный сантехник»</h1>
      <p>Выберите действие</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
        <Link href="/auth/register?role=student">
          <button style={{ width: '100%', padding: 12, fontSize: 18 }}>
            🧑‍🔧 Регистрация ученика
          </button>
        </Link>
        <Link href="/auth/login">
          <button style={{ width: '100%', padding: 12, fontSize: 18 }}>
            🔑 Вход для ученика
          </button>
        </Link>
        <Link href="/auth/login">
          <button style={{ width: '100%', padding: 12, fontSize: 18 }}>
            👨‍🏫 Вход для педагога
          </button>
        </Link>
        <Link href="/auth/login">
          <button style={{ width: '100%', padding: 12, fontSize: 18 }}>
            ⚙️ Вход для администратора
          </button>
        </Link>
      </div>
      <p style={{ marginTop: 24, fontSize: 14, color: '#666' }}>
        Ученики могут зарегистрироваться самостоятельно.<br />
        Учётные записи педагогов и администраторов создаёт администратор платформы.
      </p>
    </div>
  );
}