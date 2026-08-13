import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { createAssistant, deleteAssistant, listAssistants, updateAssistantPermissions } from '@/api/assistants';
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
import { PermissionMatrix } from './PermissionMatrix';
import type { Assistant, Permission } from '@/types';

export default function AdminAssistants() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assistants', debouncedQ, page],
    queryFn: () => listAssistants({ q: debouncedQ || undefined, page }),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPerms, setNewPerms] = useState<Permission[]>([]);
  const [formError, setFormError] = useState('');

  const [editing, setEditing] = useState<Assistant | null>(null);
  const [editPerms, setEditPerms] = useState<Permission[]>([]);
  const [deleting, setDeleting] = useState<Assistant | null>(null);

  const createMutation = useMutation({
    mutationFn: () => createAssistant({ name, email, phone: phone || null, password, permissions: newPerms }),
    onSuccess: () => {
      toast.success('Assistant created');
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
      setCreateOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setNewPerms([]);
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setFormError(Object.values(err.response.data.errors as Record<string, string[]>)[0]?.[0] ?? 'Invalid data');
      } else {
        setFormError('Could not create assistant.');
      }
    },
  });

  const permsMutation = useMutation({
    mutationFn: () => updateAssistantPermissions(editing!.id, editPerms),
    onSuccess: () => {
      toast.success('Permissions updated');
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
      setEditing(null);
    },
    onError: () => toast.error('Could not update permissions.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAssistant(id),
    onSuccess: () => {
      toast.success('Assistant removed');
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
      setDeleting(null);
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assistants</h1>
          <p className="mt-1 text-sm text-slate-500">Grant scoped access to help manage the competition.</p>
        </div>
        <Button
          onClick={() => {
            setFormError('');
            setCreateOpen(true);
          }}
        >
          <Plus className="size-4" /> Add Assistant
        </Button>
      </div>

      <Card className="mt-6 p-5">
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
        {!isLoading && data && data.data.length === 0 && <EmptyState icon={<ShieldCheck className="size-8" />} title="No assistants yet" />}

        <div className="flex flex-col gap-2">
          {data?.data.map((assistant, i) => (
            <motion.div
              key={assistant.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={assistant.name} src={assistant.avatar} size={36} />
                <div>
                  <p className="text-sm font-medium text-slate-700">{assistant.name}</p>
                  <p className="text-xs text-slate-400">
                    {assistant.email}
                    {assistant.phone && <span> · {assistant.phone}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="brand">{assistant.permissions.length} permissions</Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditing(assistant);
                    setEditPerms(assistant.permissions);
                  }}
                >
                  Manage access
                </Button>
                <button onClick={() => setDeleting(assistant)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer">
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
        title="Add Assistant"
        width={620}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <PhoneField value={phone} onChange={setPhone} />
          <Input label="Temporary password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">Permissions</p>
            <PermissionMatrix value={newPerms} onChange={setNewPerms} />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Manage access — ${editing?.name}`}
        width={620}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" loading={permsMutation.isPending} onClick={() => permsMutation.mutate()}>
              Save permissions
            </Button>
          </>
        }
      >
        <PermissionMatrix value={editPerms} onChange={setEditPerms} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove assistant"
        message={`Remove "${deleting?.name}"? They will lose all access immediately.`}
        confirmLabel="Remove"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
