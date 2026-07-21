'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
          full_name: fullName, // передаём ФИО
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

    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    window.location.href = '/dashboard/student';
  };

  if (role !== 'student') {
    return null;
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h1>Регистрация ученика</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>ФИО:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Иванов Иван Иванович"
          />
        </div>
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