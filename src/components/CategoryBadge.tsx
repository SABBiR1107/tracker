import React from 'react';
import { Category } from '../types';
import { Coffee, Zap, Pencil, ShoppingCart, Shirt, Bus, Package } from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  onClick?: () => void;
  selected?: boolean;
}

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case 'Food':
      return <Coffee size={14} />;
    case 'Utility':
      return <Zap size={14} />;
    case 'Stationary':
      return <Pencil size={14} />;
    case 'Grocery':
      return <ShoppingCart size={14} />;
    case 'Clothing':
      return <Shirt size={14} />;
    case 'Transport':
      return <Bus size={14} />;
    case 'Others':
      return <Package size={14} />;
    default:
      return null;
  }
};

const getCategoryColor = (category: Category, selected: boolean = false): string => {
  const colors: Record<string, { bg: string; text: string; selectedBg: string }> = {
    Food: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-200',
      selectedBg: 'bg-red-500 text-white',
    },
    Utility: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-200',
      selectedBg: 'bg-blue-500 text-white',
    },
    Stationary: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      selectedBg: 'bg-yellow-500 text-white',
    },
    Grocery: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-200',
      selectedBg: 'bg-green-500 text-white',
    },
    Clothing: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-800 dark:text-purple-200',
      selectedBg: 'bg-purple-500 text-white',
    },
    Transport: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-800 dark:text-indigo-200',
      selectedBg: 'bg-indigo-500 text-white',
    },
    Others: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-800 dark:text-gray-200',
      selectedBg: 'bg-gray-500 text-white',
    },
  };

  if (selected) {
    return colors[category].selectedBg;
  }
  return `${colors[category].bg} ${colors[category].text}`;
};

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, onClick, selected = false }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
        category,
        selected
      )} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {getCategoryIcon(category)}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;