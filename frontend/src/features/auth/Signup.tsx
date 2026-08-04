import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { AlertCircle, Check, X } from 'lucide-react';
import { register } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { Button } from '@/components/ui/Button';
import { AuthSwitchLink } from '@/components/AuthSwitchLink';
import { GoogleButton } from './GoogleButton';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const confirmTouched = passwordConfirmation.length > 0;
  const passwordsMatch = password === passwordConfirmation;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(name, email, password, passwordConfirmation);
      setUser(user);
      toast.success('Account created — welcome to the competition!');
      navigate('/teacher');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors as Record<string, string[]>)[0]?.[0];
        setError(firstError ?? 'Please check your details and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AuthSwitchLink question="Already have an account?" linkText="Log in" to="/login" />

      <h2 className="mt-5 text-2xl font-bold text-slate-800">Create Account</h2>
      <p className="mt-1 text-sm text-slate-500">Join as a teacher to start competing.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Full name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
        />
        <div className="flex flex-col gap-2">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <PasswordStrength password={password} />
        </div>
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label="Confirm Password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
          {confirmTouched && (
            <span className={`flex items-center gap-1 text-xs ${passwordsMatch ? 'text-success' : 'text-danger'}`}>
              {passwordsMatch ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </span>
          )}
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
          Create Account
        </Button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-3">
        <span className="text-xs text-slate-400">Sign up with</span>
        <GoogleButton variant="circle" />
      </div>
    </div>
  );
}
