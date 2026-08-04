import { useEffect } from 'react';
import { fetchMe } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import { AppRoutes } from '@/app/routes';
import { Spinner } from '@/components/ui/Spinner';

export default function App() {
  const { status, setUser, setStatus } = useAuthStore();

  useEffect(() => {
    setStatus('loading');
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, [setUser, setStatus]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  return <AppRoutes />;
}
