import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import BudgetSummary from '../components/BudgetSummary';
import ExpenseCard from '../components/ExpenseCard';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HomeTab: React.FC = () => {
  const { state, isProfileComplete } = useApp();
  const { profile, expenses } = state;
  const [activeView, setActiveView] = useState<'recent' | 'previous'>('recent');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get current month expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthExpenses = sortedExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  // Get previous months expenses (last 12 months)
  const getPreviousMonthsExpenses = () => {
    const today = new Date();
    const previousMonths = [];

    for (let i = 1; i <= 12; i++) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthExpenses = sortedExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });

      if (monthExpenses.length > 0) {
        previousMonths.push({
          month: format(monthDate, 'MMMM yyyy'),
          expenses: monthExpenses,
          total: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        });
      }
    }

    return previousMonths;
  };

  const previousMonthsExpenses = getPreviousMonthsExpenses();

  const exportToExcel = (monthData?: { month: string; expenses: any[] }) => {
    const dataToExport = monthData?.expenses || currentMonthExpenses;
    const monthLabel = monthData?.month || format(new Date(), 'MMMM yyyy');
    
    const ws = utils.json_to_sheet(dataToExport.map(expense => ({
      Date: format(new Date(expense.date), 'dd/MM/yyyy'),
      Category: expense.category,
      Description: expense.description || '-',
      Amount: `${profile.currency} ${expense.amount.toFixed(2)}`,
    })));

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Expenses');
    writeFile(wb, `expense-report-${monthLabel.toLowerCase()}.xlsx`);
  };

  const exportToPDF = (monthData?: { month: string; expenses: any[] }) => {
    const doc = new jsPDF();
    const dataToExport = monthData?.expenses || currentMonthExpenses;
    const monthLabel = monthData?.month || format(new Date(), 'MMMM yyyy');
    
    doc.setFontSize(16);
    doc.text(`Expense Report - ${monthLabel}`, 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Total: ${profile.currency} ${dataToExport.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}`, 14, 30);
    
    const tableData = dataToExport.map(expense => [
      format(new Date(expense.date), 'dd/MM/yyyy'),
      expense.category,
      expense.description || '-',
      `${profile.currency} ${expense.amount.toFixed(2)}`,
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: tableData,
    });

    doc.save(`expense-report-${monthLabel.toLowerCase()}.pdf`);
  };

  if (!isProfileComplete()) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-sm mx-auto">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Welcome to Expense Tracker</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please complete your profile to get started.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Go to the Profile tab to set up your name and monthly budget.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-7xl mx-auto">
      <div className="max-w-xl mx-auto">
        <Header title={`Hi, ${profile.name}`} />
        <BudgetSummary />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-xl mx-auto">
        {/* Toggle Buttons */}
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
          <button
            onClick={() => setActiveView('recent')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-l-lg ${
              activeView === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Recent Expenses
          </button>
          <button
            onClick={() => setActiveView('previous')}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeView === 'previous'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Previous Expenses
          </button>
        </div>

        {/* Export Options */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto"
          >
            Export Report
            <ChevronDown size={16} />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    const monthData = selectedMonth
                      ? previousMonthsExpenses.find(m => m.month === selectedMonth)
                      : undefined;
                    exportToExcel(monthData);
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                >
                  <FileSpreadsheet size={16} />
                  Export as Excel
                </button>
                <button
                  onClick={() => {
                    const monthData = selectedMonth
                      ? previousMonthsExpenses.find(m => m.month === selectedMonth)
                      : undefined;
                    exportToPDF(monthData);
                    setShowExportMenu(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                >
                  <FileText size={16} />
                  Export as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {activeView === 'recent' ? (
          // Recent Expenses View
          <div>
            {currentMonthExpenses.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No expenses recorded for this month yet.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Go to the Add tab to record your first expense.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentMonthExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Previous Expenses View
          <div>
            {previousMonthsExpenses.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No previous expenses recorded.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {previousMonthsExpenses.map((monthData) => (
                  <div
                    key={monthData.month}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold dark:text-white">
                        {monthData.month}
                      </h3>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {profile.currency} {monthData.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedMonth(monthData.month);
                            setShowExportMenu(true);
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {monthData.expenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spending Insights */}
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3 dark:text-white">
              Spending Insights
            </h2>
            
            {currentMonthExpenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-2">
                Add expenses to see insights
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top category</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {Object.entries(
                      currentMonthExpenses.reduce((acc, expense) => {
                        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])[0][0]}
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily average</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.currency}{' '}
                    {(
                      currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0) /
                      new Date(currentYear, currentMonth + 1, 0).getDate()
                    ).toFixed(2)}
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last expense</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {profile.currency} {currentMonthExpenses[0].amount.toFixed(2)}
                    <span className="block text-sm font-normal text-gray-500 dark:text-gray-400">
                      on {format(new Date(currentMonthExpenses[0].date), 'MMM dd')}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;