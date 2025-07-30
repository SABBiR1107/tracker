import React from 'react';
import { Moon, Sun, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  title: string;
  showThemeToggle?: boolean;
  showExport?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showThemeToggle = true,
  showExport = false 
}) => {
  const { toggleTheme, state } = useApp();
  const isDarkMode = state.profile.theme === 'dark';

  const exportData = () => {
    const dataStr = JSON.stringify(state.expenses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `expense-data-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
      <div className="flex space-x-2">
        {showExport && (
          <button
            onClick={exportData}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            aria-label="Export data"
          >
            <Download size={20} />
          </button>
        )}
        {showThemeToggle && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;