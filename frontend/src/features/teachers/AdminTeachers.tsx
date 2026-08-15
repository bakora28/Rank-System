import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { createTeacher, deleteTeacher, exportTeachers, listTeachers, updateTeacher } from '@/api/teachers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/auth';
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
import { Select } from '@/components/ui/Select';
import { PhoneField, isPhoneFieldValid } from '@/components/ui/PhoneField';
import { SubjectPicker } from '@/components/ui/SubjectPicker';
import type { Subject, Teacher } from '@/types';

const SUBJECT_LABEL: Record<Subject, string> = { maths: 'Maths', science: 'Science' };
const SUBJECT_TONE: Record<Subject, 'brand' | 'success'> = { maths: 'brand', science: 'success' };

export default function AdminTeachers() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [subjectFilter, setSubjectFilter] = useState<Subject | ''>('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const { can } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', debouncedQ, subjectFilter, page],
    queryFn: () => listTeachers({ q: debouncedQ || undefined, subject: subjectFilter || undefined, page }),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<Teacher | null>(null);
  const [exporting, setExporting] = useState(false);

  const [editing, setEditing] = useState<Teacher | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [editError, setEditError] = useState('');

  function openEdit(teacher: Teacher) {
    setEditing(teacher);
    setEditName(teacher.name);
    setEditEmail(teacher.email);
    setEditPhone(teacher.phone ?? '');
    setEditSubject(teacher.subject);
    setEditError('');
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportTeachers();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teachers-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export teachers.');
    } finally {
      setExporting(false);
    }
  }

  const createMutation = useMutation({
    mutationFn: () => createTeacher({ name, email, phone: phone || null, subject: subject!, password }),
    onSuccess: () => {
      toast.success('Teacher added');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setSubject(null);
      setPassword('');
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setFormError(Object.values(err.response.data.errors as Record<string, string[]>)[0]?.[0] ?? 'Invalid data');
      } else {
        setFormError('Could not add teacher.');
      }
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (t: Teacher) => updateTeacher(t.id, { name: t.name, email: t.email, is_active: !t.is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: () =>
      updateTeacher(editing!.id, {
        name: editName,
        email: editEmail,
        phone: editPhone || null,
        subject: editSubject ?? undefined,
      }),
    onSuccess: () => {
      toast.success('Teacher updated');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setEditing(null);
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setEditError(Object.values(err.response.data.errors as Record<string, string[]>)[0]?.[0] ?? 'Invalid data');
      } else {
        setEditError('Could not update teacher.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTeacher(id),
    onSuccess: () => {
      toast.success('Teacher removed');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setDeleting(null);
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
          <p className="mt-1 text-sm text-slate-500">Every teacher taking part in the competition.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" loading={exporting} onClick={handleExport}>
            <Download className="size-4" /> Export to Excel
          </Button>
          {can('teachers.add') && (
            <Button
              onClick={() => {
                setFormError('');
                setModalOpen(true);
              }}
            >
              <Plus className="size-4" /> Add Teacher
            </Button>
          )}
        </div>
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
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
          <Select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value as Subject | '');
              setPage(1);
            }}
          >
            <option value="">All subjects</option>
            <option value="maths">Maths</option>
            <option value="science">Science</option>
          </Select>
        </div>

        {isLoading && <Spinner />}
        {!isLoading && data && data.data.length === 0 && <EmptyState icon={<UserRound className="size-8" />} title="No teachers found" />}

        <div className="flex flex-col gap-2">
          {data?.data.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={teacher.name} src={teacher.avatar} size={36} />
                <div>
                  <p className="text-sm font-medium text-slate-700">{teacher.name}</p>
                  <p className="text-xs text-slate-400">
                    {teacher.email}
                    {teacher.phone && <span> · {teacher.phone}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {teacher.subject && <Badge tone={SUBJECT_TONE[teacher.subject]}>{SUBJECT_LABEL[teacher.subject]}</Badge>}
                <Badge tone="success">{teacher.approved_count} approved</Badge>
                {teacher.pending_count > 0 && <Badge tone="warning">{teacher.pending_count} pending</Badge>}
                {can('teachers.edit') && (
                  <button
                    onClick={() => toggleActiveMutation.mutate(teacher)}
                    className="cursor-pointer"
                  >
                    <Badge tone={teacher.is_active ? 'default' : 'danger'}>{teacher.is_active ? 'Active' : 'Deactivated'}</Badge>
                  </button>
                )}
                {can('teachers.edit') && (
                  <button
                    onClick={() => openEdit(teacher)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
                {can('teachers.delete') && (
                  <button onClick={() => setDeleting(teacher)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer">
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {data && <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Teacher"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={createMutation.isPending}
              disabled={!name.trim() || !email.trim() || password.length < 8 || !isPhoneFieldValid(phone) || !subject}
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
          <SubjectPicker value={subject} onChange={setSubject} />
          <Input label="Temporary password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {formError && <p className="text-sm text-danger">{formError}</p>}
        </div>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit Teacher — ${editing?.name}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={editMutation.isPending}
              disabled={!editName.trim() || !editEmail.trim() || !isPhoneFieldValid(editPhone)}
              onClick={() => editMutation.mutate()}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <Input label="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          <PhoneField value={editPhone} onChange={setEditPhone} />
          <SubjectPicker value={editSubject} onChange={setEditSubject} />
          {editError && <p className="text-sm text-danger">{editError}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Remove teacher"
        message={`Remove "${deleting?.name}" from the competition? This cannot be undone.`}
        confirmLabel="Remove"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
