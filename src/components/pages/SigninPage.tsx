'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LifeDropLogo from '@/components/ui/LifeDropLogo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { authClient, getRoleBasedRedirect, type User } from '@/lib/auth-client';

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      console.log('Signin response:', response);

      if (response.error) {
        setError(response.error.message || 'Failed to sign in');
        return;
      }

      if (response.data?.user) {
        // Redirect based on role or to specified redirect URL
        const user = response.data.user as User;
        console.log('User role:', user.role);
        const destination = redirect || getRoleBasedRedirect(user);
        console.log('Redirecting to:', destination);
        router.push(destination);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] grid place-items-center px-6">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-200 hover:text-white">
            <LifeDropLogo size={24} />
          </Link>
          <Link href="/signup" className="text-sm text-slate-300 hover:text-white">
            Create account
          </Link>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-300">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 text-sm">
          <Input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button type="submit" className="mt-1" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Tip: This demo stores a real session via BetterAuth.
        </p>
      </Card>
    </main>
  );
}