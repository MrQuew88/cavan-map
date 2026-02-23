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
        aria-label="Se d\u00e9connecter"
        className="btn-press rounded-lg px-3 py-1.5 text-[11px] font-medium text-[var(--text-tertiary)] ring-1 ring-[var(--border)] transition-all duration-150 hover:text-[var(--text-secondary)] hover:ring-[var(--border-hover)]"
        style={{ backgroundColor: 'rgba(205, 180, 140, 0.05)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(205, 180, 140, 0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(205, 180, 140, 0.05)')}
      >
        D\u00e9connexion
      </button>
    </div>
  );
}
