import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Plus, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { type AdminUser, createAdmin, deleteAdmin, listAdmins } from '@/api/admins';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { PhoneField, isPhoneFieldValid } from '@/components/ui/PhoneField';

export default function AdminAdmins() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admins', debouncedQ, page],
    queryFn: () => listAdmins({ q: debouncedQ || undefined, page }),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const createMutation = useMutation({
    mutationFn: () => createAdmin({ name, email, phone: phone || null, password }),
    onSuccess: () => {
      toast.success('Admin created');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setCreateOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setFormError(Object.values(err.response.data.errors as Record<string, string[]>)[0]?.[0] ?? 'Invalid data');
      } else {
        setFormError('Could not create admin.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdmin(id),
    onSuccess: () => {
      toast.success('Admin removed');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setDeleting(null);
    },
    onError: () => {
      toast.error('Could not remove this admin.');
      setDeleting(null);
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admins</h1>
          <p className="mt-1 text-sm text-slate-500">Full-access administrators — every admin can do everything, including manage other admins.</p>
        </div>
        <Button
          onClick={() => {
            setFormError('');
            setCreateOpen(true);
          }}
        >
          <Plus className="size-4" /> Add Admin
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700"
      >
        <ShieldAlert className="size-4 shrink-0" />
        New admins get full, unrestricted access to everything in this dashboard — unlike assistants, there's no permission scoping.
      </motion.div>

      <Card className="mt-4 p-5">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="size-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full max-w-xs bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {isLoading && <Spinner />}
        {!isLoading && data && data.data.length === 0 && <EmptyState icon={<Crown className="size-8" />} title="No admins found" />}

        <div className="flex flex-col gap-2">
          {data?.data.map((admin, i) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={admin.name} src={admin.avatar} size={36} />
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    {admin.name}
                    {admin.is_self && <Badge tone="brand">You</Badge>}
                  </p>
                  <p className="text-xs text-slate-400">
                    {admin.email}
                    {admin.phone && <span> · {admin.phone}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => !admin.is_self && setDeleting(admin)}
                  disabled={admin.is_self}
                  title={admin.is_self ? "You can't remove your own account" : 'Remove admin'}
                  className="rounded-lg p-1.5 text-slate-400 enabled:hover:bg-red-50 enabled:hover:text-danger disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {data && <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />}
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Admin"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={createMutation.isPending}
              disabled={!name.trim() || !email.trim() || password.length < 8 || !isPhoneFieldValid(phone)}
              onClick={() => createMutation.mutate()}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PhoneField value={phone} onChange={setPhone} />
          <Input label="Temporary password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {formError && <p className="text-sm text-danger">{formError}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove admin"
        message={`Remove "${deleting?.name}"? They will immediately lose all access.`}
        confirmLabel="Remove"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
