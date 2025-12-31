
import React from 'react';
import { AuctionSession, ApprovalDocument, SessionStatus, SessionResult, ApprovalStatus } from '../types';
import KPICard from '../components/KPICard';
import { Gavel, PlayCircle, CheckCircle, XCircle, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { format, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OverviewProps {
  data: {
    sessions: AuctionSession[];
    docs: ApprovalDocument[];
  };
}

const Overview: React.FC<OverviewProps> = ({ data }) => {
  const { sessions, docs } = data;

  const totalSessions = sessions.length;
  const ongoing = sessions.filter(s => s.session_status === SessionStatus.ONGOING).length;
  const ended = sessions.filter(s => s.session_status === SessionStatus.ENDED).length;
  const canceled = sessions.filter(s => s.session_status === SessionStatus.CANCELED).length;
  
  const successfulSessions = sessions.filter(s => s.session_result === SessionResult.SUCCESS).length;
  const successRate = ended > 0 ? (successfulSessions / ended) * 100 : 0;

  // Chart Data: Grouped by Month
  const monthlyDataMap = new Map();
  sessions.forEach(s => {
    const month = format(s.start_time, 'MM/yyyy');
    if (!monthlyDataMap.has(month)) {
      monthlyDataMap.set(month, { month, registrations: 0, revenue: 0, count: 0 });
    }
    const mData = monthlyDataMap.get(month);
    mData.registrations += s.registrations_count;
    mData.revenue += s.revenue;
    mData.count += 1;
  });
  const chartData = Array.from(monthlyDataMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  // Approval Stats
  const pendingDocs = docs.filter(d => d.status === ApprovalStatus.PENDING);
  const overdueDocs = pendingDocs.filter(d => new Date() > d.due_date).length;
  const approvedDocs = docs.filter(d => d.status === ApprovalStatus.APPROVED);
  const onTimeApproved = approvedDocs.filter(d => d.approved_at && d.approved_at <= d.due_date).length;
  const onTimeRate = approvedDocs.length > 0 ? (onTimeApproved / approvedDocs.length) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="Tổng phiên đấu giá" value={totalSessions} icon={<Gavel size={24} />} trend={12} color="primary" />
        <KPICard title="Đang diễn ra" value={ongoing} icon={<PlayCircle size={24} />} trend={5} color="warning" />
        <KPICard title="Đã kết thúc" value={ended} icon={<CheckCircle size={24} />} trend={8} color="success" />
        <KPICard title="Bị hủy" value={canceled} icon={<XCircle size={24} />} trend={-2} color="danger" />
        <KPICard title="Tỷ lệ thành công" value={successRate.toFixed(1)} icon={<BarChart3 size={24} />} suffix="%" color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue & Registration Charts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-darkText">Người tham gia & Doanh thu theo tháng</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#0F6CBD" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#2CB44E" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => value.toLocaleString()}
                />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="registrations" name="Người đăng ký" fill="#0F6CBD" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar yAxisId="right" dataKey="revenue" name="Doanh thu (VNĐ)" fill="#2CB44E" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Workflow Table Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-darkText">Quy trình phê duyệt</h3>
            <button className="text-primary text-sm font-medium hover:underline">Chi tiết workflow</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-orange-500 text-white rounded-lg">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Hồ sơ tồn</p>
                <p className="text-2xl font-bold text-orange-900">{pendingDocs.length}</p>
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-red-500 text-white rounded-lg">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Quá hạn</p>
                <p className="text-2xl font-bold text-red-900">{overdueDocs}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50">
              <span className="text-sm text-gray-600">Thời gian duyệt trung bình</span>
              <span className="font-bold text-darkText">18.5 giờ</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50">
              <span className="text-sm text-gray-600">Tỷ lệ đúng hạn (SLA)</span>
              <span className={`font-bold ${onTimeRate > 80 ? 'text-success' : 'text-warning'}`}>{onTimeRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50">
              <span className="text-sm text-gray-600">Đã duyệt (Tháng này)</span>
              <span className="font-bold text-darkText">{approvedDocs.length}</span>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-success h-full" style={{ width: `${onTimeRate}%` }}></div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 text-center uppercase font-bold tracking-widest">Hiệu suất vận hành (Health Check)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
