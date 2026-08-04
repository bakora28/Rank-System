import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createCategory, deleteCategory, listCategories, updateCategory } from '@/api/categories';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import type { Category } from '@/types';

const SWATCHES = ['#2f8fe0', '#8e44ad', '#27ae60', '#e67e22', '#16a085', '#e0473f', '#f0b429', '#1a3f6c'];

export default function AdminCategories() {
  const { can } = useAuthStore();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: listCategories });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [deleting, setDeleting] = useState<Category | null>(null);

  function openCreate() {
    setEditing(null);
    setName('');
    setColor(SWATCHES[0]);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setName(category.name);
    setColor(category.color);
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => (editing ? updateCategory(editing.id, { name, color }) : createCategory({ name, color })),
    onSuccess: () => {
      toast.success(editing ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setModalOpen(false);
    },
    onError: () => toast.error('Could not save category.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleting(null);
    },
    onError: () => toast.error('Could not delete category.'),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Manage subjects and the books inside them.</p>
        </div>
        {can('categories.add') && (
          <Button onClick={openCreate}>
            <Plus className="size-4" /> New Category
          </Button>
        )}
      </div>

      {isLoading && <Spinner />}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((category, i) => (
          <motion.div key={category.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <Link to={`/admin/categories/${category.id}`} className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl text-white" style={{ background: category.color }}>
                    <BookOpen className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{category.name}</p>
                    <p className="text-xs text-slate-400">{category.books_count} books</p>
                  </div>
                </Link>
                {(can('categories.edit') || can('categories.delete')) && (
                  <div className="flex gap-1">
                    {can('categories.edit') && (
                      <button onClick={() => openEdit(category)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer">
                        <Pencil className="size-3.5" />
                      </button>
                    )}
                    {can('categories.delete') && (
                      <button onClick={() => setDeleting(category)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Category' : 'New Category'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()} disabled={!name.trim()}>
              Save
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Astronomy" />
          <div>
            <span className="text-xs font-medium text-slate-600">Color</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  onClick={() => setColor(swatch)}
                  style={{ background: swatch }}
                  className={`size-7 rounded-full transition-transform cursor-pointer ${color === swatch ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete category"
        message={`Delete "${deleting?.name}" and all of its books? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
