import React from 'react';
import { Expense } from '../types';
import { format } from 'date-fns';
import { Trash2, Coffee, Zap, Pencil, ShoppingCart, Shirt, Bus, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExpenseCardProps {
  expense: Expense;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food':
      return <Coffee size={18} />;
    case 'Utility':
      return <Zap size={18} />;
    case 'Stationary':
      return <Pencil size={18} />;
    case 'Grocery':
      return <ShoppingCart size={18} />;
    case 'Clothing':
      return <Shirt size={18} />;
    case 'Transport':
      return <Bus size={18} />;
    case 'Others':
      return <Package size={18} />;
    default:
      return <Package size={18} />;
  }
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Food: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    Utility: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Stationary: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    Grocery: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    Clothing: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    Transport: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    Others: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return colors[category] || colors.Others;
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const { deleteExpense, state } = useApp();
  const { currency } = state.profile;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className={`rounded-full p-3 mr-4 ${getCategoryColor(expense.category)}`}>
          {getCategoryIcon(expense.category)}
        </div>
        <div>
          <h3 className="font-medium dark:text-white">
            {expense.description || expense.category}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(expense.date), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <span className="font-semibold mr-4 dark:text-white">
          {currency} {expense.amount.toFixed(2)}
        </span>
        <button
          onClick={() => deleteExpense(expense.id)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default ExpenseCard;