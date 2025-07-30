import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';
import Header from '../components/Header';
import CategoryBadge from '../components/CategoryBadge';
import { format } from 'date-fns';
import { Coffee, Zap, Pencil, ShoppingCart, Shirt, Bus, Package } from 'lucide-react';

const categories: Category[] = [
  'Food',
  'Utility',
  'Stationary',
  'Grocery',
  'Clothing',
  'Transport',
  'Others',
];

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'Food':
      return <Coffee size={16} />;
    case 'Utility':
      return <Zap size={16} />;
    case 'Stationary':
      return <Pencil size={16} />;
    case 'Grocery':
      return <ShoppingCart size={16} />;
    case 'Clothing':
      return <Shirt size={16} />;
    case 'Transport':
      return <Bus size={16} />;
    case 'Others':
      return <Package size={16} />;
    default:
      return null;
  }
};

const AddExpenseTab: React.FC = () => {
  const { addExpense, state, isProfileComplete } = useApp();
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    addExpense({
      amount: parseFloat(amount),
      category,
      date,
      description,
    });

    // Reset form
    setAmount('');
    setCategory('Food');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setDescription('');
  };

  if (!isProfileComplete()) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Complete Your Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please set up your profile before adding expenses.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Go to the Profile tab to set up your name and monthly budget.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <Header title="Add Expense" />
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount ({state.profile.currency})
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
              {state.profile.currency}
            </span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div 
                key={cat} 
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                  category === cat 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{getCategoryIcon(cat)}</span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="mb-5">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Lunch at restaurant"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpenseTab;