import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppState, Expense, UserProfile } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Initial state
const initialState: AppState = {
  profile: {
    name: '',
    budget: 0,
    currency: 'USD',
    theme: 'light',
    user_id: '',
  },
  expenses: [],
  user: null,
  isLoading: false,
};

// Action types
type Action =
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: any };

// Reducer function
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((expense) => expense.id !== action.payload),
      };
    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload,
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        profile: {
          ...state.profile,
          theme: state.profile.theme === 'light' ? 'dark' : 'light',
        },
      };
    case 'SET_CURRENCY':
      return {
        ...state,
        profile: {
          ...state.profile,
          currency: action.payload,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create context
interface AppContextType {
  state: AppState;
  setProfile: (profile: UserProfile) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  getTotalExpenses: () => number;
  getRemainingBalance: () => number;
  getExpensesByCategory: () => Record<string, number>;
  isProfileComplete: () => boolean;
  loadUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // Set user when auth state changes
  useEffect(() => {
    dispatch({ type: 'SET_USER', payload: user });
  }, [user]);

  // Apply theme
  useEffect(() => {
    if (state.profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.profile.theme]);

  // Check budget alerts
  useEffect(() => {
    const totalExpenses = getTotalExpenses();
    const { budget } = state.profile;
    
    if (budget > 0 && totalExpenses >= budget * 0.8 && totalExpenses < budget) {
      toast.warning('You have used 80% of your monthly budget!', {
        duration: 5000,
        position: 'top-center',
      });
    } else if (budget > 0 && totalExpenses >= budget) {
      toast.error('You have exceeded your monthly budget!', {
        duration: 5000,
        position: 'top-center',
      });
    }
  }, [state.expenses]);

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      dispatch({ type: 'SET_EXPENSES', payload: [] });
      dispatch({ type: 'SET_PROFILE', payload: initialState.profile });
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        dispatch({ type: 'SET_PROFILE', payload: profileData });
      } else if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            name: '',
            budget: 0,
            currency: 'USD',
            theme: 'light',
          })
          .select()
          .single();

        if (newProfile && !createError) {
          dispatch({ type: 'SET_PROFILE', payload: newProfile });
        } else {
          console.error('Error creating profile:', createError);
        }
      } else if (profileError) {
        console.error('Error loading profile:', profileError);
      }

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (expensesData) {
        dispatch({ type: 'SET_EXPENSES', payload: expensesData });
      }

      if (expensesError) {
        console.error('Error loading expenses:', expensesError);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Context functions
  const setProfile = async (profile: UserProfile) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          user_id: user.id,
        });

      if (error) {
        toast.error('Failed to save profile');
        return;
      }

      dispatch({ type: 'SET_PROFILE', payload: { ...profile, user_id: user.id } });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const newExpense = {
        ...expense,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert(newExpense)
        .select()
        .single();

      if (error) {
        toast.error('Failed to add expense');
        return;
      }

      dispatch({ type: 'ADD_EXPENSE', payload: data });
      toast.success('Expense added successfully!');
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete expense');
        return;
      }

      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      toast.success('Expense deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const toggleTheme = async () => {
    const newTheme = state.profile.theme === 'light' ? 'dark' : 'light';
    const updatedProfile = { ...state.profile, theme: newTheme };
    await setProfile(updatedProfile);
  };

  const setCurrency = async (currency: string) => {
    const updatedProfile = { ...state.profile, currency };
    await setProfile(updatedProfile);
  };

  const getTotalExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return state.expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getRemainingBalance = () => {
    return state.profile.budget - getTotalExpenses();
  };

  const getExpensesByCategory = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return state.expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        );
      })
      .reduce((acc, expense) => {
        const { category, amount } = expense;
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);
  };

  const isProfileComplete = () => {
    return state.profile.name !== '' && state.profile.budget > 0;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setProfile,
        addExpense,
        deleteExpense,
        toggleTheme,
        setCurrency,
        getTotalExpenses,
        getRemainingBalance,
        getExpensesByCategory,
        isProfileComplete,
        loadUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};