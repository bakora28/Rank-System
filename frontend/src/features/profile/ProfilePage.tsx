import { type FormEvent, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import { AlertCircle, Camera, Check, X } from 'lucide-react';
import { updateProfile, updatePassword, uploadAvatar } from '@/api/profile';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { PhoneField, isPhoneFieldValid } from '@/components/ui/PhoneField';
import { SubjectPicker } from '@/components/ui/SubjectPicker';
import { Button } from '@/components/ui/Button';
import type { Subject } from '@/types';

function firstError(err: unknown, fallback: string) {
  if (axios.isAxiosError(err) && err.response?.status === 422) {
    return Object.values(err.response.data.errors as Record<string, string[]>)[0]?.[0] ?? fallback;
  }
  return fallback;
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [subject, setSubject] = useState<Subject | null>(user?.subject ?? null);
  const [infoError, setInfoError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isTeacher = user?.role === 'teacher';
  const phoneValid = isPhoneFieldValid(phone);
  const subjectValid = !isTeacher || !!subject;
  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch = newPassword === confirmPassword;

  const infoMutation = useMutation({
    mutationFn: () => updateProfile({ name, email, phone: phone || null, ...(isTeacher && subject ? { subject } : {}) }),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success('Profile updated');
      setInfoError('');
    },
    onError: (err) => setInfoError(firstError(err, 'Could not update profile.')),
  });

  const passwordMutation = useMutation({
    mutationFn: () => updatePassword({ current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword }),
    onSuccess: () => {
      toast.success('Password changed');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => setPasswordError(firstError(err, 'Could not change password.')),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.invalidateQueries();
      toast.success('Profile picture updated');
    },
    onError: () => toast.error('Could not upload image (max 4MB, JPG/PNG).'),
  });

  function handleInfoSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phoneValid || !subjectValid) return;
    infoMutation.mutate();
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    passwordMutation.mutate();
  }

  function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
    e.target.value = '';
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account details, picture, and password.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="flex items-center gap-5 p-6">
          <div className="relative">
            <Avatar name={user.name} src={user.avatar} size={72} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarMutation.isPending}
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 disabled:opacity-60 cursor-pointer"
              title="Change profile picture"
            >
              <Camera className="size-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="mt-1 text-xs text-slate-400">{avatarMutation.isPending ? 'Uploading…' : 'JPG or PNG, up to 4MB'}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-800">Profile Information</h2>
          <form onSubmit={handleInfoSubmit} className="mt-4 flex flex-col gap-4">
            <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <PhoneField value={phone} onChange={setPhone} />
            {isTeacher && (
              <SubjectPicker
                value={subject}
                onChange={setSubject}
                label={subject ? 'Subject' : 'Subject — choose yours to appear on the leaderboard'}
              />
            )}

            {infoError && (
              <p className="flex items-center gap-1.5 text-sm text-danger">
                <AlertCircle className="size-3.5 shrink-0" /> {infoError}
              </p>
            )}

            <Button type="submit" loading={infoMutation.isPending} disabled={!phoneValid || !subjectValid} className="self-start">
              Save changes
            </Button>
          </form>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-800">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="mt-4 flex flex-col gap-4">
            <PasswordInput
              label="Current password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <PasswordInput
                label="New password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
              <PasswordStrength password={newPassword} />
            </div>
            <div className="flex flex-col gap-1.5">
              <PasswordInput
                label="Confirm new password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmTouched && (
                <span className={`flex items-center gap-1 text-xs ${passwordsMatch ? 'text-success' : 'text-danger'}`}>
                  {passwordsMatch ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              )}
            </div>

            {passwordError && (
              <p className="flex items-center gap-1.5 text-sm text-danger">
                <AlertCircle className="size-3.5 shrink-0" /> {passwordError}
              </p>
            )}

            <Button
              type="submit"
              loading={passwordMutation.isPending}
              disabled={!currentPassword || newPassword.length < 8 || !passwordsMatch}
              className="self-start"
            >
              Update password
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
