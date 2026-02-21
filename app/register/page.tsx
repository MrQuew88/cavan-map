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
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/30">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-white">
          Cavan Map
        </h1>
        <p className="mb-8 text-[13px] text-white/40">
          Créer un compte
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
            placeholder="Mot de passe (8 caractères min.)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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
            {loading ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
        <p className="mt-6 text-[13px] text-white/30">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-white/60 underline underline-offset-2 transition-colors duration-150 hover:text-white">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
