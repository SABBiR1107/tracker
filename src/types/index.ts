export type Category = 
  | 'Food' 
  | 'Utility' 
  | 'Stationary' 
  | 'Grocery' 
  | 'Clothing' 
  | 'Transport' 
  | 'Others';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description?: string;
  user_id: string;
  created_at?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  budget: number;
  currency: string;
  theme: 'light' | 'dark';
  user_id: string;
  created_at?: string;
}

export interface AppState {
  profile: UserProfile;
  expenses: Expense[];
  user: User | null;
  isLoading: boolean;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}