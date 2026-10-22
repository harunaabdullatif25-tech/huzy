'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400 text-xs">
      Redirecting to Admin Portal (/admin/login)...
    </div>
  );
}
