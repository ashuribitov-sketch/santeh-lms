import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Публичные страницы: главная, вход, регистрация
  if (pathname === '/' || pathname.startsWith('/auth')) {
    if (user && pathname.startsWith('/auth')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      const role = profile?.role || 'student';
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
    return NextResponse.next();
  }

  // Защищённые страницы /dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = profile?.role || 'student';

    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    const requestedRole = pathname.split('/')[2];
    if (requestedRole && requestedRole !== role) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};