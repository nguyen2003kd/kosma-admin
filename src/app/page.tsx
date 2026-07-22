'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@stores/auth';
import { FallbackSpinner } from "@/components/shared/fallbackspinner";
import { admin } from '@/lib/navigation';
export default function HomePage() {
  const router = useRouter();
  const auth = useAuthStore();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;


    if (auth.username && token) {
      router.replace(admin.dashboard());
    } else {
      router.replace(admin.login());
    }
  }, [hasHydrated, auth.username, router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FallbackSpinner fullScreen={true} />
      </div>
    </div>
  );
}