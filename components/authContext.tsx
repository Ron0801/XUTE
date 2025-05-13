import * as React from 'react';

import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

const AuthContext = React.createContext<{ user: User | null }>({ user: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/'); 
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): { user: User | null } => React.useContext(AuthContext);
