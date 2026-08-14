import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle2, MessageCircle, Phone, Plus, QrCode, Search, Send, Trash2, X, XCircle } from 'lucide-react';
import {
  createWhatsappAccount,
  deleteWhatsappAccount,
  fetchWhatsappQrCode,
  listWhatsappAccounts,
  sendWhatsappBroadcast,
  updateWhatsappAccount,
  type WhatsappAudience,
  type WhatsappSendResult,
} from '@/api/whatsapp';
import { listTeachers } from '@/api/teachers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SubjectPicker } from '@/components/ui/SubjectPicker';
import type { Subject, WhatsappAccount } from '@/types';

const AUDIENCE_TABS: { value: WhatsappAudience; label: string }[] = [
  { value: 'all', label: 'All teachers' },
  { value: 'subject', label: 'By category' },
  { value: 'manual', label: 'Pick manually' },
];

function errorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.message) return data.message;
    const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
    if (firstFieldError) return firstFieldError;
  }
  return fallback;
}

/** GREEN-API returns { type: 'qrCode', message: '<base64 png>' } once authorized-and-pending. */
function extractQrImageSrc(qrcode: Record<string, unknown> | null): string | null {
  const message = qrcode?.message;
  if (qrcode?.type === 'qrCode' && typeof message === 'string' && message.length > 0) {
    return message.startsWith('data:') ? message : `data:image/png;base64,${message}`;
  }
  return null;
}

function qrStatusMessage(qrcode: Record<string, unknown> | null): string {
  switch (qrcode?.type) {
    case 'alreadyLogged':
      return 'This number is already linked and authorized.';
    case 'error':
      return 'The provider returned an error — double-check your access parameters.';
    case 'passkeyRequired':
      return 'This instance requires a passkey — set it up in your Green-API console first.';
    default:
      return qrcode ? "Couldn't read a QR image from the provider's response." : 'No QR code received yet.';
  }
}

function AddNumberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [qrcode, setQrcode] = useState<Record<string, unknown> | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);

  const canCreate = label.trim() && apiUrl.trim() && instanceId.trim() && accessToken.trim();

  const createMutation = useMutation({
    mutationFn: () => createWhatsappAccount({ label, api_url: apiUrl, instance_id: instanceId, access_token: accessToken }),
    onSuccess: (res) => {
      toast.success('Number created — scan the QR code to link it');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-accounts'] });
      setQrcode(res.qrcode);
      setAccountId(res.data.id);
    },
    onError: (err) => toast.error(errorMessage(err, 'Could not create a new WhatsApp number.')),
  });

  const refreshQrMutation = useMutation({
    mutationFn: () => fetchWhatsappQrCode(accountId!),
    onSuccess: (qr) => setQrcode(qr),
    onError: (err) => toast.error(errorMessage(err, 'Could not refresh the QR code.')),
  });

  function handleClose() {
    setLabel('');
    setApiUrl('');
    setInstanceId('');
    setAccessToken('');
    setQrcode(null);
    setAccountId(null);
    onClose();
  }

  const qrSrc = extractQrImageSrc(qrcode);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add WhatsApp Number"
      width={440}
      footer={
        accountId ? (
          <Button size="sm" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" loading={createMutation.isPending} disabled={!canCreate} onClick={() => createMutation.mutate()}>
              Save &amp; Get QR
            </Button>
          </>
        )
      }
    >
      {!accountId ? (
        <div className="flex flex-col gap-4">
          <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. School Front Desk" />
          <Input
            label="API URL"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="e.g. https://7105.api.greenapi.com"
          />
          <Input label="Instance ID" value={instanceId} onChange={(e) => setInstanceId(e.target.value)} placeholder="idInstance" />
          <PasswordInput
            label="Access token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="apiTokenInstance"
          />
          <p className="text-xs text-slate-400">
            Create an instance in your Green-API console, then copy its <span className="font-medium">apiUrl</span>,{' '}
            <span className="font-medium">idInstance</span>, and <span className="font-medium">apiTokenInstance</span> here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-slate-600">Open WhatsApp on the phone for this number → Linked Devices → Link a Device, then scan:</p>
          {qrSrc ? (
            <img src={qrSrc} alt="WhatsApp QR code" className="size-56 rounded-xl border border-slate-100 object-contain" />
          ) : (
            <div className="flex size-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 text-slate-400">
              <QrCode className="size-8" />
              <p className="max-w-[200px] text-xs">{qrStatusMessage(qrcode)}</p>
            </div>
          )}
          <Button size="sm" variant="secondary" loading={refreshQrMutation.isPending} onClick={() => refreshQrMutation.mutate()}>
            <QrCode className="size-3.5" /> Refresh QR
          </Button>
        </div>
      )}
    </Modal>
  );
}

function ManualTeacherPicker({
  selected,
  onChange,
}: {
  selected: { id: number; name: string }[];
  onChange: (next: { id: number; name: string }[]) => void;
}) {
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);
  const { data, isLoading } = useQuery({
    queryKey: ['teachers', 'whatsapp-picker', debouncedQ],
    queryFn: () => listTeachers({ q: debouncedQ || undefined, page: 1 }),
    enabled: debouncedQ.length > 0,
  });

  const selectedIds = new Set(selected.map((t) => t.id));

  function toggle(teacher: { id: number; name: string }) {
    if (selectedIds.has(teacher.id)) {
      onChange(selected.filter((t) => t.id !== teacher.id));
    } else {
      onChange([...selected, teacher]);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <Search className="size-4 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teacher by name or email..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {debouncedQ.length > 0 && (
        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-slate-100">
          {isLoading && <Spinner />}
          {!isLoading && data?.data.length === 0 && <p className="px-3 py-3 text-center text-xs text-slate-400">No teachers found</p>}
          {data?.data.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle({ id: t.id, name: t.name })}
              className={clsx(
                'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                selectedIds.has(t.id) ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-600'
              )}
            >
              <span>
                {t.name} <span className="text-xs text-slate-400">· {t.email}</span>
              </span>
              {selectedIds.has(t.id) && <CheckCircle2 className="size-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selected.map((t) => (
            <span key={t.id} className="flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-brand-700">
              {t.name}
              <button onClick={() => toggle(t)} className="rounded-full p-0.5 hover:bg-brand-100 cursor-pointer">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminWhatsApp() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading } = useQuery({ queryKey: ['whatsapp-accounts'], queryFn: listWhatsappAccounts });

  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<WhatsappAccount | null>(null);

  const [accountId, setAccountId] = useState<number | ''>('');
  const [audience, setAudience] = useState<WhatsappAudience>('all');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [manualSelected, setManualSelected] = useState<{ id: number; name: string }[]>([]);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<WhatsappSendResult | null>(null);

  const activeAccounts = accounts?.filter((a) => a.is_active) ?? [];

  const toggleActiveMutation = useMutation({
    mutationFn: (account: WhatsappAccount) => updateWhatsappAccount(account.id, { is_active: !account.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp-accounts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWhatsappAccount(id),
    onSuccess: () => {
      toast.success('Number removed');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-accounts'] });
      setDeleting(null);
    },
  });

  const canSend =
    !!accountId &&
    message.trim().length > 0 &&
    (audience === 'all' || (audience === 'subject' && !!subject) || (audience === 'manual' && manualSelected.length > 0));

  const sendMutation = useMutation({
    mutationFn: () =>
      sendWhatsappBroadcast({
        account_id: accountId as number,
        message,
        audience,
        subject: audience === 'subject' ? subject! : undefined,
        teacher_ids: audience === 'manual' ? manualSelected.map((t) => t.id) : undefined,
      }),
    onSuccess: (res) => {
      setResult(res);
      toast.success(`Sent to ${res.sent} teacher${res.sent === 1 ? '' : 's'}`);
    },
    onError: (err) => toast.error(errorMessage(err, 'Could not send WhatsApp messages.')),
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">WhatsApp Automation</h1>
        <p className="mt-1 text-sm text-slate-500">Send WhatsApp messages to teachers, filtered by category or picked by hand.</p>
      </div>

      {/* Numbers management */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">WhatsApp Numbers</h2>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Add Number
          </Button>
        </div>

        {isLoading && <Spinner />}
        {!isLoading && accounts?.length === 0 && (
          <EmptyState icon={<Phone className="size-8" />} title="No WhatsApp numbers yet" description="Add one to start sending messages." />
        )}

        <div className="flex flex-col gap-2">
          {accounts?.map((account, i) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{account.label}</p>
                  <p className="text-xs text-slate-400">Instance: {account.instance_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActiveMutation.mutate(account)} className="cursor-pointer">
                  <Badge tone={account.is_active ? 'success' : 'default'}>{account.is_active ? 'Active' : 'Disabled'}</Badge>
                </button>
                <button
                  onClick={() => setDeleting(account)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Send panel */}
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Send a Message</h2>

        <div className="flex flex-col gap-4">
          <Select label="Send from" value={accountId} onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Choose a WhatsApp number...</option>
            {activeAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </Select>

          <div>
            <span className="text-xs font-medium text-slate-600">Send to</span>
            <div className="mt-1.5 inline-flex rounded-lg bg-slate-100 p-1">
              {AUDIENCE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setAudience(tab.value)}
                  className={clsx(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                    audience === tab.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {audience === 'subject' && <SubjectPicker value={subject} onChange={setSubject} label="Category" />}
          {audience === 'manual' && <ManualTeacherPicker selected={manualSelected} onChange={setManualSelected} />}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Reminder: buy a book this month to stay in the running for the iPad!"
              rows={4}
              maxLength={2000}
              className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <Button className="self-start" loading={sendMutation.isPending} disabled={!canSend} onClick={() => sendMutation.mutate()}>
            <Send className="size-4" /> Autosend
          </Button>

          {result && (
            <div className="flex flex-wrap gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <span className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-4" /> {result.sent} sent
              </span>
              {result.failed > 0 && (
                <span className="flex items-center gap-1.5 text-danger">
                  <XCircle className="size-4" /> {result.failed} failed{result.failed_names.length > 0 && ` (${result.failed_names.join(', ')})`}
                </span>
              )}
              {result.skipped_no_phone > 0 && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MessageCircle className="size-4" /> {result.skipped_no_phone} skipped (no phone on file)
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      <AddNumberModal open={addOpen} onClose={() => setAddOpen(false)} />

      <ConfirmDialog
        open={!!deleting}
        title="Remove WhatsApp number"
        message={`Remove "${deleting?.label}"? You'll need to scan a new QR code if you want to reconnect this number later.`}
        confirmLabel="Remove"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
