import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import { roleHome } from '@/lib/roleHome';
import { Spinner } from '@/components/ui/Spinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    fetchMe()
      .then((user) => {
        setUser(user);
        navigate(roleHome(user.role), { replace: true });
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [navigate, setUser]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Spinner />
    </div>
  );
}
