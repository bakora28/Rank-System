import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Pencil, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { awardGift, createGift, deleteGift, listGifts, updateGift, type GiftPayload } from '@/api/gifts';
import { broadcastNotification } from '@/api/notifications';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { GiftCard } from './GiftCard';
import { GiftFormModal } from './GiftFormModal';
import { AwardGiftModal } from './AwardGiftModal';
import { WinnersHistory } from './WinnersHistory';
import type { Gift, Subject } from '@/types';

const AUDIENCE_OPTIONS: { value: Subject | 'all'; label: string }[] = [
  { value: 'all', label: 'All teachers' },
  { value: 'maths', label: 'Maths teachers' },
  { value: 'science', label: 'Science teachers' },
];

function NotifyTeachersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [audience, setAudience] = useState<Subject | 'all'>('all');
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: () => broadcastNotification({ message, subject: audience === 'all' ? null : audience }),
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.sent_to} teacher${data.sent_to === 1 ? '' : 's'}`);
      setMessage('');
      setAudience('all');
      onClose();
    },
    onError: () => toast.error('Could not send notification.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notify Teachers"
      width={480}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" loading={mutation.isPending} disabled={!message.trim()} onClick={() => mutation.mutate()}>
            <Bell className="size-3.5" /> Send
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-medium text-slate-600">Send to</span>
          <div className="mt-1.5 inline-flex rounded-lg bg-slate-100 p-1">
            {AUDIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAudience(opt.value)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  audience === opt.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. New iPad gift up for grabs this term — buy books to climb the leaderboard!"
            rows={4}
            maxLength={500}
            className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </label>
      </div>
    </Modal>
  );
}

export default function AdminGifts() {
  const { can } = useAuthStore();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['gifts'], queryFn: listGifts });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Gift | null>(null);
  const [awarding, setAwarding] = useState<Gift | null>(null);
  const [deleting, setDeleting] = useState<Gift | null>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: GiftPayload) => (editing ? updateGift(editing.id, payload) : createGift(payload)),
    onSuccess: () => {
      toast.success(editing ? 'Gift updated' : 'Gift created');
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      setFormOpen(false);
    },
    onError: () => toast.error('Could not save gift.'),
  });

  const awardMutation = useMutation({
    mutationFn: (userId: number) => awardGift(awarding!.id, userId),
    onSuccess: () => {
      toast.success('Gift awarded!');
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      queryClient.invalidateQueries({ queryKey: ['gift-winners'] });
      setAwarding(null);
    },
    onError: () => toast.error('Could not award gift.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGift(id),
    onSuccess: () => {
      toast.success('Gift deleted');
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      setDeleting(null);
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gifts &amp; Rewards</h1>
          <p className="mt-1 text-sm text-slate-500">Configure prizes and control when they're awarded.</p>
        </div>
        <div className="flex items-center gap-2">
          {can('notifications.add') && (
            <Button variant="secondary" onClick={() => setNotifyOpen(true)}>
              <Bell className="size-4" /> Notify Teachers
            </Button>
          )}
          {can('gifts.add') && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" /> New Gift
            </Button>
          )}
        </div>
      </div>

      {isLoading && <Spinner />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data?.map((gift, i) => (
          <GiftCard
            key={gift.id}
            gift={gift}
            index={i}
            actions={
              (can('gifts.edit') || can('gifts.delete')) && (
                <>
                  {can('gifts.edit') && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setEditing(gift);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                  )}
                  {can('gifts.edit') && (
                    <Button size="sm" className="flex-1" onClick={() => setAwarding(gift)}>
                      Award
                    </Button>
                  )}
                  {can('gifts.delete') && (
                    <button
                      onClick={() => setDeleting(gift)}
                      className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </>
              )
            }
          />
        ))}
      </div>

      <WinnersHistory />

      <GiftFormModal
        open={formOpen}
        gift={editing}
        loading={saveMutation.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <AwardGiftModal gift={awarding} loading={awardMutation.isPending} onClose={() => setAwarding(null)} onAward={(userId) => awardMutation.mutate(userId)} />

      <NotifyTeachersModal open={notifyOpen} onClose={() => setNotifyOpen(false)} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete gift"
        message={`Delete "${deleting?.name}"? Its award history will be kept, but it will no longer appear here.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
