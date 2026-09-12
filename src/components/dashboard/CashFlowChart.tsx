import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useFinance } from '../../context/FinanceContext';
import { getMonthName } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const CashFlowChart: React.FC = () => {
  const { transactions, settings, t } = useFinance();

  // Aggregate income and expense across past 6 months
  const now = new Date();
  const monthsData: { label: string; yearMonth: string; income: number; expense: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${getMonthName(d.getMonth() + 1)} ${d.getFullYear() % 100}`;
    monthsData.push({ label, yearMonth, income: 0, expense: 0 });
  }

  transactions.forEach(tx => {
    if (!tx.date) return;
    const txMonth = tx.date.substring(0, 7);
    const target = monthsData.find(m => m.yearMonth === txMonth);
    if (target) {
      if (tx.type === 'income') target.income += Number(tx.amount);
      if (tx.type === 'expense') target.expense += Number(tx.amount);
    }
  });

  const data = {
    labels: monthsData.map(m => m.label),
    datasets: [
      {
        label: t('income'),
        data: monthsData.map(m => m.income),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: t('expense'),
        data: monthsData.map(m => m.expense),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit, Inter, Noto Sans Tamil', size: 12 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y || 0;
            return ` ${context.dataset.label}: ${settings.currencySymbol || '₹'}${val.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit, Inter, Noto Sans Tamil', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Outfit, Inter, Noto Sans Tamil', size: 11 },
          callback: (value: any) => `${settings.currencySymbol || '₹'}${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`,
        },
      },
    },
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-white text-base">{t('cashFlowTrend')}</h3>
          <p className="text-xs text-slate-400">{t('cashFlowSubtitle')}</p>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
