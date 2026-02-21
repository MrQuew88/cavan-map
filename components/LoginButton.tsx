'use client';

import { signOut, useSession } from 'next-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs text-white/50 md:inline">
        {session.user.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="btn-press rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors duration-150 hover:bg-white/14 hover:text-white/80"
      >
        Déconnexion
      </button>
    </div>
  );
}
