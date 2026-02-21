export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/((?!api/auth|api/register|api/migrate|login|register|_next/static|_next/image|favicon.ico).*)'],
};
