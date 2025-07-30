import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import BottomNavigation from './components/BottomNavigation';
import HomeTab from './tabs/HomeTab';
import AddExpenseTab from './tabs/AddExpenseTab';
import StatisticsTab from './tabs/StatisticsTab';
import ProfileTab from './tabs/ProfileTab';
import AuthForm from './components/AuthForm';
import { Toaster } from 'react-hot-toast';
import { LogOut } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, isLoading, signOut } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show authentication form if user is not logged in
  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
      />
    );
  }

  // Render the main app if user is logged in
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'add':
        return <AddExpenseTab />;
      case 'stats':
        return <StatisticsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Toaster />
      
      {/* Header with user info and logout */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expense Tracker
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {user.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto pb-16">
        {renderTabContent()}
      </div>
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;