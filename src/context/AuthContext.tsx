import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/supabase';
import { User, AuthState } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const { user } = await auth.getCurrentUser();
        if (user) {
          setUser({
            id: user.id,
            email: user.email!,
            created_at: user.created_at,
          });
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await auth.signUp(email, password);
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        toast.success('Account created successfully! Please check your email for verification.');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await auth.signIn(email, password);
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await auth.signOut();
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        toast.success('Signed out successfully!');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 