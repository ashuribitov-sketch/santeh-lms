import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* Фоновая сетка */}
      <div style={styles.gridOverlay} />
      {/* Плавающие сантехнические элементы */}
      <div style={styles.floatingElements}>
        <span style={{ ...styles.floatingIcon, top: '10%', left: '5%', fontSize: 80, opacity: 0.6 }}>🔧</span>
        <span style={{ ...styles.floatingIcon, top: '20%', right: '8%', fontSize: 60, opacity: 0.5 }}>🔩</span>
        <span style={{ ...styles.floatingIcon, bottom: '15%', left: '10%', fontSize: 70, opacity: 0.4 }}>🛠️</span>
        <span style={{ ...styles.floatingIcon, bottom: '25%', right: '5%', fontSize: 90, opacity: 0.55 }}>⚙️</span>
        <span style={{ ...styles.floatingIcon, top: '40%', left: '3%', fontSize: 50, opacity: 0.35 }}>🔧</span>
        <span style={{ ...styles.floatingIcon, top: '35%', right: '15%', fontSize: 75, opacity: 0.45 }}>🔩</span>
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <span style={styles.logoIcon}>🛠️</span>
          <h1 style={styles.title}>Академия Сантехники</h1>
          <p style={styles.subtitle}>
            Стань профессионалом. Обучение сантехнике от теории к практике
          </p>
          <div style={styles.actions}>
            <Link href="/auth/register?role=student">
              <button style={styles.primaryBtn}>
                🧑‍🔧 Регистрация ученика
              </button>
            </Link>
            <Link href="/auth/login">
              <button style={styles.secondaryBtn}>
                🔑 Вход для ученика
              </button>
            </Link>
            <Link href="/auth/login">
              <button style={styles.secondaryBtn}>
                👨‍🏫 Вход для педагога
              </button>
            </Link>
            <Link href="/auth/login">
              <button style={styles.secondaryBtn}>
                ⚙️ Вход для администратора
              </button>
            </Link>
          </div>
          <p style={styles.footerNote}>
            Педагоги и администраторы получают доступ после создания учётной записи администратором.
          </p>
        </div>
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
    zIndex: 0,
  },
  floatingIcon: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.15)',
    filter: 'drop-shadow(0 0 8px rgba(0,86,185,0.5))',
    userSelect: 'none',
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 500,
    width: '100%',
    textAlign: 'center',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 16,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0,86,185,0.3)',
    padding: '48px 32px',
  },
  logoIcon: {
    fontSize: 56,
    display: 'block',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 700,
    marginBottom: 12,
    textShadow: '0 2px 10px rgba(0,86,185,0.5)',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginBottom: 36,
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 24,
  },
  primaryBtn: {
    width: '100%',
    padding: '16px 0',
    fontSize: 18,
    background: 'linear-gradient(180deg, #0056b9 0%, #003d80 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,86,185,0.4), 0 2px 4px rgba(0,0,0,0.3)',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    width: '100%',
    padding: '14px 0',
    fontSize: 16,
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 500,
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s ease',
  },
  footerNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 16,
  },
};