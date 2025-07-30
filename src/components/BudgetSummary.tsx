import React from 'react';
import { useApp } from '../context/AppContext';

const BudgetSummary: React.FC = () => {
  const { state, getTotalExpenses, getRemainingBalance } = useApp();
  const { currency } = state.profile;
  
  const totalExpenses = getTotalExpenses();
  const remainingBalance = getRemainingBalance();
  const percentSpent = state.profile.budget > 0 
    ? (totalExpenses / state.profile.budget) * 100 
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">Monthly Budget</h3>
          <p className="text-2xl font-bold dark:text-white">
            {currency} {state.profile.budget.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-semibold dark:text-white">Remaining</h3>
          <p className={`text-2xl font-bold ${
            remainingBalance < 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            {currency} {remainingBalance.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
        <div 
          className={`h-2.5 rounded-full ${
            percentSpent >= 100 
              ? 'bg-red-500' 
              : percentSpent >= 80 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentSpent, 100)}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Total Spent: {currency} {totalExpenses.toFixed(2)}</span>
        <span>{percentSpent.toFixed(0)}% of budget used</span>
      </div>
    </div>
  );
};

export default BudgetSummary;