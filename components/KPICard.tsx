
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  prefix?: string;
  suffix?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, prefix, suffix, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-gray-400 text-lg">{prefix}</span>}
          <h3 className="text-2xl font-bold text-darkText">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          {suffix && <span className="text-gray-500 text-sm font-medium">{suffix}</span>}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}% so với tháng trước</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
};

export default KPICard;
