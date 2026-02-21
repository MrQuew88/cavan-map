'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

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
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/30">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-white">
          Cavan Map
        </h1>
        <p className="mb-8 text-[13px] text-white/40">
          Outil d'annotation — Lough Oughter
        </p>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field py-3"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field py-3"
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-press w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-opacity duration-150 hover:opacity-90 disabled:opacity-40"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-6 text-[13px] text-white/30">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-white/60 underline underline-offset-2 transition-colors duration-150 hover:text-white">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
