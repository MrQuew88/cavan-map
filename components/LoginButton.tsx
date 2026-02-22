'use client';

import { signOut, useSession } from 'next-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-[11px] font-light text-[var(--text-tertiary)] md:inline">
        {session.user.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        aria-label="Se déconnecter"
        className="btn-press rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-medium text-[var(--text-tertiary)] ring-1 ring-[var(--border)] transition-all duration-150 hover:bg-white/8 hover:text-[var(--text-secondary)] hover:ring-[var(--border-hover)]"
      >
        Déconnexion
      </button>
    </div>
  );
}
