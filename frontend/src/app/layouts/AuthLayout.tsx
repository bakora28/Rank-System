import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CubeCluster } from '@/components/ui/CubeCluster';
import logoFull from '@/assets/logo-full.png';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 p-4 sm:p-8">
      {/* Decorative background: blobs + dot grid */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/4 size-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-40 lg:block"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          maskImage: 'radial-gradient(ellipse at 80% 30%, black 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-2"
      >
        {/* Illustration panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#f7f6fc] p-10 lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage: 'radial-gradient(rgba(124,58,237,0.12) 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px',
            }}
          />

          <a href="/login" className="relative z-10 flex items-center">
            <img src={logoFull} alt="TeacherPlanet" className="h-16 w-auto" />
          </a>

          <div className="relative z-10 flex flex-1 items-center justify-center">
            <CubeCluster />
          </div>

          <p className="relative z-10 text-sm text-slate-500">
            Track book purchases, climb the leaderboard, and win real rewards for your school.
          </p>
        </div>

        {/* Form panel */}
        <div className="p-7 sm:p-10">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
