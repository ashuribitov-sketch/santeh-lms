'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'student',
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.user) {
      setError('Не удалось создать пользователя. Попробуйте позже.');
      return;
    }

    // Устанавливаем сессию, чтобы пользователь стал авторизован
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    // После регистрации ученик всегда попадает на дашборд ученика
    // Роль student гарантирована, поэтому не делаем лишний запрос профиля
    window.location.href = '/dashboard/student';
  };

  // Если в URL другая роль — ничего не показываем (редирект на главную должен быть на уровне middleware)
  if (role !== 'student') {
    return null;
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h1>Регистрация ученика</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль (минимум 6 символов):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <RegisterForm />
    </Suspense>
  );
}