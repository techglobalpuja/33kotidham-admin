import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { isAuthenticated } from '@/utils/auth';

export const useAuth = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const checkAuth = () => {
    const authenticated = isAuthenticated() && user;
    return authenticated;
  };

  return { isAuthenticated: checkAuth(), user };
};

export const useRequireAuth = () => {
  const router = useRouter();
  const { isAuthenticated: authenticated, user } = useAuth();

  useEffect(() => {
    if (!authenticated) {
      router.push('/admin/signin');
    }
  }, [authenticated, router]);

  return { isAuthenticated: authenticated, user };
};

export const useRedirectIfAuthenticated = () => {
  const router = useRouter();
  const { isAuthenticated: authenticated, user } = useAuth();

  useEffect(() => {
    if (authenticated) {
      router.push('/admin');
    }
  }, [authenticated, router]);

  return { isAuthenticated: authenticated, user };
};