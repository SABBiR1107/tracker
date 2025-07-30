import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

type TimeRange = 'week' | 'month' | 'year';

const StatisticsTab: React.FC = () => {
  const { state, isProfileComplete } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { expenses, profile } = state;

  if (!isProfileComplete()) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Complete Your Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please set up your profile to view statistics.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Go to the Profile tab to set up your name and monthly budget.
          </p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-4 pb-20">
        <Header title="Statistics" />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No expenses recorded yet.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Add some expenses to see your statistics.
          </p>
        </div>
      </div>
    );
  }

  // Filter expenses based on selected time range
  const getFilteredExpenses = () => {
    const today = new Date();
    let startDate: Date;
    let endDate = today;

    switch (timeRange) {
      case 'week':
        startDate = subDays(today, 7);
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'year':
        startDate = startOfYear(today);
        endDate = endOfYear(today);
        break;
      default:
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  // Prepare data for pie chart (expenses by category)
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#FF6384', // red
          '#36A2EB', // blue
          '#FFCE56', // yellow
          '#4BC0C0', // teal
          '#9966FF', // purple
          '#FF9F40', // orange
          '#C9CBCF', // gray
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for bar chart (daily/weekly/monthly expenses)
  const getBarChartData = () => {
    let labels: string[] = [];
    let data: number[] = [];

    if (timeRange === 'week') {
      // Daily expenses for the week
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        labels.push(format(date, 'EEE'));
        
        const dailyTotal = filteredExpenses
          .filter(expense => expense.date === dateStr)
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        data.push(dailyTotal);
      }
    } else if (timeRange === 'month') {
      // Weekly expenses for the month
      const today = new Date();
      const startOfMonthDate = startOfMonth(today);
      const endOfMonthDate = endOfMonth(today);
      const totalDays = endOfMonthDate.getDate();
      const weeksInMonth = Math.ceil(totalDays / 7);
      
      for (let i = 0; i < weeksInMonth; i++) {
        const weekStart = new Date(startOfMonthDate);
        weekStart.setDate(weekStart.getDate() + i * 7);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        if (weekEnd > endOfMonthDate) {
          weekEnd.setDate(endOfMonthDate.getDate());
        }
        
        labels.push(`Week ${i + 1}`);
        
        const weeklyTotal = filteredExpenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= weekStart && expenseDate <= weekEnd;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        data.push(weeklyTotal);
      }
    } else if (timeRange === 'year') {
      // Monthly expenses for the year
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const currentYear = new Date().getFullYear();
      
      for (let i = 0; i < 12; i++) {
        labels.push(months[i]);
        
        const monthlyTotal = filteredExpenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === i && expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        data.push(monthlyTotal);
      }
    }

    return { labels, data };
  };

  const { labels, data } = getBarChartData();

  const barChartData = {
    labels,
    datasets: [
      {
        label: `Expenses (${profile.currency})`,
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: profile.theme === 'dark' ? '#fff' : '#666',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += `${profile.currency} ${context.parsed.toFixed(2)}`;
            } else if (context.raw !== undefined) {
              label += `${profile.currency} ${context.raw.toFixed(2)}`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: profile.theme === 'dark' ? '#fff' : '#666',
        },
        grid: {
          color: profile.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: profile.theme === 'dark' ? '#fff' : '#666',
        },
        grid: {
          color: profile.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // Calculate total for the selected period
  const totalForPeriod = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="p-4 pb-20">
      <Header title="Statistics" showExport={true} />
      
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
            } border border-gray-200 dark:border-gray-600`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
            } border-t border-b border-gray-200 dark:border-gray-600`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeRange === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
            } border border-gray-200 dark:border-gray-600`}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-1 dark:text-white">
          Total for {timeRange === 'week' ? 'this week' : timeRange === 'month' ? 'this month' : 'this year'}
        </h2>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {profile.currency} {totalForPeriod.toFixed(2)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3 dark:text-white">Expenses by Category</h2>
          <div className="h-64">
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3 dark:text-white">
            {timeRange === 'week'
              ? 'Daily Expenses'
              : timeRange === 'month'
              ? 'Weekly Expenses'
              : 'Monthly Expenses'}
          </h2>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;