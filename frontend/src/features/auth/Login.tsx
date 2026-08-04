import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import { roleHome } from '@/lib/roleHome';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from './GoogleButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [params] = useSearchParams();

  const deactivated = params.get('error') === 'account_deactivated';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password, remember);
      setUser(user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(roleHome(user.role));
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
      <p className="mt-1 text-sm text-slate-500">Login your account.</p>

      {deactivated && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700"
        >
          <AlertCircle className="size-4 shrink-0" /> Your account has been deactivated.
        </motion.p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
        />
        <div>
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded accent-brand-500"
            />
            Remember me
          </label>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: [0, -4, 4, -2, 0] }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-1.5 text-sm text-danger"
          >
            <AlertCircle className="size-3.5 shrink-0" /> {error}
          </motion.p>
        )}

        <Button type="submit" loading={loading} className="mt-1 w-full !rounded-full bg-gradient-to-r from-brand-600 to-violet-600 hover:brightness-105">
          Login
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-6 flex flex-col items-center gap-3">
        <span className="text-xs text-slate-400">Login with</span>
        <GoogleButton variant="circle" />
      </div>
    </div>
  );
}
