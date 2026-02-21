'use client';

import { signOut, useSession } from 'next-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        <img
          src={session.user.image}
          alt=""
          className="h-8 w-8 rounded-full"
        />
      )}
      <span className="hidden text-sm text-white/80 md:inline">
        {session.user.name}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/20"
      >
        Sign out
      </button>
    </div>
  );
}
