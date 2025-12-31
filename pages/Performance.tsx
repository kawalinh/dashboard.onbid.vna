
import React from 'react';
import { AuctionSession, SessionStatus } from '../types';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell, 
  BarChart, 
  Bar, 
  LabelList,
  CartesianGrid
} from 'recharts';

interface PerformanceProps {
  data: {
    sessions: AuctionSession[];
  };
}

const Performance: React.FC<PerformanceProps> = ({ data }) => {
  const { sessions } = data;

  // Funnel logic (approximate by session status lifecycle)
  const funnelData = [
    { name: 'Khởi tạo/Kế hoạch', value: sessions.length, fill: '#0F6CBD' },
    { name: 'Đang diễn ra', value: sessions.filter(s => s.session_status === SessionStatus.ONGOING).length + sessions.filter(s => s.session_status === SessionStatus.ENDED).length, fill: '#1F8CEB' },
    { name: 'Đã hoàn thành', value: sessions.filter(s => s.session_status === SessionStatus.ENDED).length, fill: '#2CB44E' },
    { name: 'Thành công', value: sessions.filter(s => s.session_result === 'Thành công').length, fill: '#10b981' },
  ];

  // Scatter data: registrations count vs winning price
  const scatterData = sessions
    .filter(s => s.winning_price > 0)
    .map(s => ({
      x: s.registrations_count,
      y: s.winning_price / 1000000, // Million VNĐ
      name: s.session_title
    })).slice(0, 100);

  // Histogram simulation: sessions by registration range
  const histogramData = [
    { range: '0-5', count: sessions.filter(s => s.registrations_count <= 5).length },
    { range: '6-15', count: sessions.filter(s => s.registrations_count > 5 && s.registrations_count <= 15).length },
    { range: '16-30', count: sessions.filter(s => s.registrations_count > 15 && s.registrations_count <= 30).length },
    { range: '31+', count: sessions.filter(s => s.registrations_count > 30).length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel chart using a custom Bar Chart style */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-darkText">Phễu chuyển đổi phiên đấu giá</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ left: 50, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={150} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">Thể hiện hiệu quả chuyển đổi từ lúc tiếp nhận tài sản đến lúc đấu giá thành công.</p>
        </div>

        {/* Histogram */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-darkText">Phân bố số lượng người đăng ký/phiên</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" label={{ value: 'Số người đăng ký', position: 'bottom', offset: 0 }} />
                <YAxis label={{ value: 'Số phiên', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1F8CEB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scatter plot */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 text-darkText">Tương quan: Số người đăng ký vs Giá trúng</h3>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Số người đăng ký" unit=" ng" />
              <YAxis type="number" dataKey="y" name="Giá trúng" unit=" Tr VNĐ" />
              <ZAxis type="number" range={[100, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Phiên đấu giá" data={scatterData} fill="#0F6CBD" fillOpacity={0.6}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_SCATTER[index % COLORS_SCATTER.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const COLORS_SCATTER = ['#0F6CBD', '#1F8CEB', '#2CB44E', '#FFB200', '#E33E3E'];

export default Performance;
