'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard
    router.push('/admin');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Dashboard...</h1>
        <p className="text-gray-600">If you are not redirected automatically, <a href="/admin" className="text-blue-500 hover:underline">click here</a>.</p>
      </div>
    </div>
  );
}