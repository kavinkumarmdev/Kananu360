import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, CATEGORY_PALETTE } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

export const CategoryBreakdown: React.FC = () => {
  const { transactions, categories, settings, totalExpenseThisMonth, t, getCategoryName } = useFinance();

  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const thisMonthExpenses = transactions.filter(
    tx => tx.type === 'expense' && tx.date && tx.date.startsWith(currentYearMonth)
  );

  // Group by category
  const categorySpendMap: { [catId: string]: number } = {};
  thisMonthExpenses.forEach(tx => {
    categorySpendMap[tx.category] = (categorySpendMap[tx.category] || 0) + Number(tx.amount);
  });

  const categoryEntries = Object.entries(categorySpendMap)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat ? getCategoryName(cat.id, cat.name) : 'Other',
        color: cat ? cat.color : '#64748b',
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const data = {
    labels: categoryEntries.length > 0 ? categoryEntries.map(c => c.name) : [t('noExpensesThisMonth')],
    datasets: [
      {
        data: categoryEntries.length > 0 ? categoryEntries.map(c => c.amount) : [1],
        backgroundColor:
          categoryEntries.length > 0
            ? categoryEntries.map((c, i) => c.color || CATEGORY_PALETTE[i % CATEGORY_PALETTE.length])
            : ['#334155'],
        borderColor: 'rgba(15, 23, 42, 0.8)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed || 0;
            const pct = totalExpenseThisMonth > 0 ? Math.round((val / totalExpenseThisMonth) * 100) : 0;
            return ` ${settings.currencySymbol || '₹'}${val.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between h-[340px]">
      <div>
        <h3 className="font-bold text-white text-base">{t('expenseBreakdown')}</h3>
        <p className="text-xs text-slate-400">{t('currentMonthByCategory')}</p>
      </div>

      <div className="flex items-center justify-center my-auto relative h-40">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('total')}</span>
          <span className="text-sm font-black text-white">
            {formatCurrency(totalExpenseThisMonth, settings.currency)}
          </span>
        </div>
      </div>

      {/* Top 3 Legend items */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        {categoryEntries.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 truncate">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-200 shrink-0">
              {formatCurrency(item.amount, settings.currency)}
            </span>
          </div>
        ))}
        {categoryEntries.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-1">{t('noExpensesThisMonth')}</p>
        )}
      </div>
    </div>
  );
};
