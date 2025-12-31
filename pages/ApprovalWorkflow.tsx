
import React from 'react';
import { ApprovalDocument, ApprovalStatus } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { format, differenceInHours } from 'date-fns';

interface ApprovalWorkflowProps {
  data: {
    docs: ApprovalDocument[];
  };
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ data }) => {
  const { docs } = data;

  // Group by date for lead time chart
  const dailyLeadTimeMap = new Map();
  docs.filter(d => d.status === ApprovalStatus.APPROVED && d.approved_at).forEach(d => {
    const day = format(d.submitted_at, 'dd/MM');
    if (!dailyLeadTimeMap.has(day)) {
      dailyLeadTimeMap.set(day, { day, totalHours: 0, count: 0 });
    }
    const mData = dailyLeadTimeMap.get(day);
    mData.totalHours += differenceInHours(d.approved_at!, d.submitted_at);
    mData.count += 1;
  });

  const leadTimeChartData = Array.from(dailyLeadTimeMap.values())
    .map(d => ({ ...d, avgLeadTime: Math.round(d.totalHours / d.count) }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // Group by group for SLA chart
  const groupSlaMap = new Map();
  docs.filter(d => d.status === ApprovalStatus.APPROVED).forEach(d => {
    const group = d.approver_group;
    if (!groupSlaMap.has(group)) {
      groupSlaMap.set(group, { group, total: 0, onTime: 0 });
    }
    const mData = groupSlaMap.get(group);
    mData.total += 1;
    if (d.approved_at && d.approved_at <= d.due_date) {
      mData.onTime += 1;
    }
  });

  const slaChartData = Array.from(groupSlaMap.values()).map(g => ({
    group: g.group,
    onTimeRate: Math.round((g.onTime / g.total) * 100)
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Time Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-2 text-darkText">Thời gian phê duyệt trung bình</h3>
          <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-bold">Lead time (Giờ)</p>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadTimeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avgLeadTime" 
                  name="TG Trung bình" 
                  stroke="#0F6CBD" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0F6CBD', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-2 text-darkText">Tỷ lệ phê duyệt đúng hạn (%)</h3>
          <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-bold">Hiệu suất theo Nhóm/Đơn vị</p>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="group" stroke="#94a3b8" fontSize={11} interval={0} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="onTimeRate" name="Đúng hạn (%)" fill="#2CB44E" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-darkText">Danh sách hồ sơ cần phê duyệt khẩn cấp</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                <th className="py-4 px-6">Mã tài liệu</th>
                <th className="py-4 px-6">Nhóm phê duyệt</th>
                <th className="py-4 px-6">Ngày nộp</th>
                <th className="py-4 px-6">Hạn cuối (SLA)</th>
                <th className="py-4 px-6">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docs.filter(d => d.status === ApprovalStatus.PENDING).slice(0, 10).map((doc) => {
                const isOverdue = new Date() > doc.due_date;
                return (
                  <tr key={doc.doc_id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-darkText text-sm">{doc.doc_id}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{doc.approver_group}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{format(doc.submitted_at, 'dd/MM/yyyy HH:mm')}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{format(doc.due_date, 'dd/MM/yyyy')}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isOverdue ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {isOverdue ? 'Quá hạn' : 'Đang chờ'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 text-center">
          <button className="text-sm text-primary font-bold hover:underline">Xem toàn bộ 142 hồ sơ tồn</button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
