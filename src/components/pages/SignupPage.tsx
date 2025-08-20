'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LifeDropLogo from '@/components/ui/LifeDropLogo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { authClient } from '@/lib/auth-client';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strengthScore, setStrengthScore] = useState(0);

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 5);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setStrengthScore(calculateStrength(pwd));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });

      console.log('Signup response:', response);

      if (response.error) {
        setError(response.error.message || 'Failed to create account');
        return;
      }

      if (response.data) {
        // Redirect to portal (new users are donors by default)
        const destination = redirect ? decodeURIComponent(redirect) : '/portal';
        console.log('Redirecting to:', destination);
        router.push(destination);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const strengthLabels = ['too weak', 'weak', 'okay', 'good', 'strong'];
  const strengthLabel = strengthLabels[Math.max(0, strengthScore - 1)] || 'too weak';

  return (
    <>
      <header className="mx-auto max-w-7xl px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-200 hover:text-white">
          <LifeDropLogo size={26} />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Visual panel */}
          <div className="hidden lg:flex relative glass rounded-3xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blood-500/10 to-rose-500/10"></div>
            <div className="p-10 relative z-10 flex flex-col justify-end min-h-[460px]">
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Trusted by thousands of donors
                </span>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight">Create your LifeDrop account</h1>
              <p className="mt-3 text-slate-300">Donate blood, get matched faster, and track your impact over time.</p>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center text-sm">
                <Card className="p-4">
                  <div className="text-2xl font-extrabold">25k+</div>
                  <div className="text-slate-300">Donors</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-extrabold">73k+</div>
                  <div className="text-slate-300">Lives Saved</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-extrabold">120</div>
                  <div className="text-slate-300">Cities</div>
                </Card>
              </div>
            </div>
            <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-blood-500/20 blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl"></div>
          </div>

          {/* Form panel */}
          <Card className="p-6 md:p-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-extrabold">Sign up</h2>
              <Link href="/signin" className="text-sm text-slate-300 hover:text-white">
                Have an account? Sign in
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input name="name" placeholder="Full Name" required />
                <Input type="email" name="email" placeholder="Email address" required />
              </div>
              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create password"
                    minLength={6}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                  >
                    👁️
                  </button>
                </div>
                <div className="mt-2 h-2 w-full rounded bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 transition-all"
                    style={{ width: `${strengthScore * 20}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-slate-300">Strength: {strengthLabel}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Select name="group" required>
                  <option value="" disabled>Blood Group</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </Select>
                <Input name="city" placeholder="City" required />
              </div>
              <label className="flex items-center gap-3 text-xs">
                <input type="checkbox" required className="accent-blood-600" />
                <span>I agree to the Terms and Privacy Policy</span>
              </label>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <Button type="submit" className="mt-2" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-xs text-slate-300">
                By creating an account you can access donation requests, receive alerts, and track your donation history.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} LifeDrop
      </footer>
    </>
  );
}
