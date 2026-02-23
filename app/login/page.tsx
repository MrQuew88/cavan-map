'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

function PikeSilhouette({ className }: { className?: string }) {
  return (
    <svg width="40" height="18" viewBox="0 0 40 18" fill="none" className={className} aria-hidden="true">
      <path
        d="M1 9.5C3 7.5 6 6 9.5 5.5c3-.4 5.5.5 8 1.2 2 .6 4.5.8 7 .3 2-.4 4-1.2 5.5-2.5 1-.8 2.2-2 3.5-3.5.5-.5 1.2-.3 1.2.4 0 1.5-.5 3.5-1.5 5 1.5-.2 3.5-.8 5.3-1.8.5-.3 1 .1.8.6-.8 2-2.5 3.8-4.5 4.8 1.2.8 2 2 2.2 3.2.1.5-.3.9-.7.6-1.5-.8-3.2-1.2-5-1-1 .2-2 .5-3.2 1-1.8.8-3.8 1.5-6 1.8-2.5.3-5 .2-7.5-.5-2.8-.8-5-2-7.2-3.3C5 10 3 9.5 1 9.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Adresse e-mail ou mot de passe incorrect');
      setLoading(false);
    } else {
      router.push('/');
    }
  }

  return (
    <div className="contour-bg relative flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--bg)] px-4">
      <div className="stagger-enter relative w-full max-w-[360px]">
        <div className="paper-grain relative rounded-2xl bg-[var(--panel)]/90 p-8 text-center shadow-2xl shadow-black/30 ring-1 ring-[var(--border)] backdrop-blur-xl">
          <PikeSilhouette className="mx-auto mb-3 text-[var(--text-tertiary)]" />
          <h1 className="mb-1 font-serif text-2xl italic text-[var(--text-primary)]">
            Cavan Map
          </h1>
          <p className="mb-7 text-[11px] font-light uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
            Lough Oughter &middot; Co. Cavan
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="login-email" className="sr-only">Adresse e-mail</label>
              <input
                id="login-email"
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field py-3"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-field py-3"
              />
            </div>
            {error && (
              <p role="alert" aria-live="assertive" className="text-[13px] text-[var(--destructive)]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full rounded-xl py-3 text-[13px] font-semibold transition-opacity duration-150 disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              {loading ? 'Connexion\u2026' : 'Se connecter'}
            </button>
          </form>
          <p className="mt-6 text-[12px] text-[var(--text-tertiary)]">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium text-[var(--accent)] underline-offset-2 transition-colors duration-150 hover:underline">
              Cr\u00e9er un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
