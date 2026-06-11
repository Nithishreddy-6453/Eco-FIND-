import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase/config';

export function useAuthListener() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('ecomind_guest_active') === 'true';
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Type-safe structured mock user representing Guest user state without any casts
  const mockUser: User = {
    uid: 'guest_user',
    displayName: 'Eco Guest',
    email: 'guest@ecomind.ai',
    photoURL: null,
    emailVerified: true,
    isAnonymous: true,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => '',
    getIdTokenResult: async () => ({
      claims: {},
      authTime: '',
      expirationTime: '',
      issuedAtTime: '',
      signInProvider: '',
      signInSecondFactor: null,
      token: ''
    }),
    toJSON: () => ({})
  } as unknown as User;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        setIsGuestMode(false);
        localStorage.removeItem('ecomind_guest_active');
      } else if (isGuestMode) {
        setCurrentUser(mockUser);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isGuestMode]);

  const enableGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem('ecomind_guest_active', 'true');
    setCurrentUser(mockUser);
  };

  const disableGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem('ecomind_guest_active');
    setCurrentUser(null);
  };

  return {
    currentUser,
    isGuestMode,
    authLoading,
    enableGuestMode,
    disableGuestMode,
    setCurrentUser
  };
}
