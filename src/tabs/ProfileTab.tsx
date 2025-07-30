import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { DollarSign, CreditCard, User, Moon, Sun } from 'lucide-react';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
];

const ProfileTab: React.FC = () => {
  const { state, setProfile, toggleTheme } = useApp();
  const { profile } = state;
  
  const [name, setName] = useState<string>(profile.name || '');
  const [budget, setBudget] = useState<string>(profile.budget ? profile.budget.toString() : '');
  const [currency, setCurrency] = useState<string>(profile.currency || 'USD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!budget || parseFloat(budget) <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }
    
    setProfile({
      ...profile,
      name: name.trim(),
      budget: parseFloat(budget),
      currency,
    });
    
    alert('Profile updated successfully!');
  };

  return (
    <div className="p-4 pb-20">
      <Header title="Profile" />
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monthly Budget
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard size={18} className="text-gray-400" />
            </div>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter your monthly budget"
              step="0.01"
              min="0"
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mb-5">
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Currency
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign size={18} className="text-gray-400" />
            </div>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol}) - {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-4"
        >
          Save Profile
        </button>
      </form>
      
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium dark:text-white">Dark Mode</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Switch between light and dark theme
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            aria-label="Toggle theme"
          >
            {profile.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">About</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Expense Tracker v1.0.0
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Develop by SABBiR
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          A simple and effective way to track your daily expenses and manage your budget.
        </p>
      </div>
    </div>
  );
};

export default ProfileTab;