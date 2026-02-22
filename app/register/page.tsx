'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      const messages: Record<string, string> = {
        'Email and password are required': "L'adresse e-mail et le mot de passe sont requis",
        'Password must be at least 8 characters': 'Le mot de passe doit contenir au moins 8 caractères',
        'Email already registered': 'Cette adresse e-mail est déjà utilisée',
      };
      setError(messages[data.error] || "L'inscription a échoué");
      setLoading(false);
      return;
    }

    router.push('/login');
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--bg)] px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34, 211, 238, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[360px] rounded-2xl bg-[var(--panel)]/80 p-8 text-center shadow-2xl shadow-black/40 ring-1 ring-[var(--border)] backdrop-blur-xl">
        <h1 className="mb-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Cavan<span className="ml-0.5 font-light text-[var(--text-tertiary)]">Map</span>
        </h1>
        <p className="mb-7 text-[12px] font-light text-[var(--text-tertiary)]">
          Créer un compte
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="register-email" className="sr-only">Adresse e-mail</label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="sr-only">Mot de passe</label>
            <input
              id="register-password"
              type="password"
              placeholder="Mot de passe (8 caractères min.)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
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
            {loading ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
        <p className="mt-6 text-[12px] text-[var(--text-tertiary)]">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 transition-colors duration-150 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
