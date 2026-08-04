import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { listCategories } from '@/api/categories';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function TeacherCategories() {
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: listCategories });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
      <p className="mt-1 text-sm text-slate-500">Pick a subject to browse its books.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((category, i) => (
          <motion.div key={category.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/teacher/categories/${category.id}`}>
              <Card className="group flex items-center gap-4 p-5 transition-shadow hover:shadow-card-hover">
                <div
                  className="flex size-12 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105"
                  style={{ background: category.color }}
                >
                  <BookOpen className="size-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{category.name}</p>
                  <p className="text-xs text-slate-400">{category.books_count} books</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
