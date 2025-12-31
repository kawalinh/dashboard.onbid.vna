
import React, { useState } from 'react';
import { AuctionSession, Asset, SessionResult } from '../types';
import { Search, ChevronRight, ArrowUpDown } from 'lucide-react';

interface OwnerAnalysisProps {
  data: {
    sessions: AuctionSession[];
    assets: Asset[];
    owners: { id: string; name: string }[];
  };
}

const OwnerAnalysis: React.FC<OwnerAnalysisProps> = ({ data }) => {
  const { sessions, assets, owners } = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

  const ownerStats = owners.map(o => {
    const ownerAssets = assets.filter(a => a.owner_id === o.id);
    const ownerSessions = sessions.filter(s => ownerAssets.some(a => a.asset_id === s.asset_id));
    const successCount = ownerSessions.filter(s => s.session_result === SessionResult.SUCCESS).length;
    const totalRevenue = ownerSessions.reduce((acc, curr) => acc + curr.revenue, 0);
    
    return {
      ...o,
      assetCount: ownerAssets.length,
      sessionCount: ownerSessions.length,
      successRate: ownerSessions.length > 0 ? (successCount / ownerSessions.length) * 100 : 0,
      revenue: totalRevenue
    };
  }).filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredStats = selectedOwner 
    ? ownerStats.filter(o => o.id === selectedOwner)
    : ownerStats;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-darkText">Hiệu quả theo Chủ tài sản</h2>
          <p className="text-gray-500 text-sm">Phân tích kết quả đấu giá theo đơn vị cung cấp tài sản.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm chủ tài sản..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-80 focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                <th className="py-4 px-6">Chủ tài sản</th>
                <th className="py-4 px-6 text-right">Số phiên <ArrowUpDown size={10} className="inline" /></th>
                <th className="py-4 px-6 text-right">Tỷ lệ thành công</th>
                <th className="py-4 px-6 text-right">Doanh thu mang lại</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStats.map((owner) => (
                <tr key={owner.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedOwner(selectedOwner === owner.id ? null : owner.id)}>
                  <td className="py-5 px-6">
                    <p className="font-bold text-darkText group-hover:text-primary transition-colors">{owner.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{owner.assetCount} tài sản đăng ký</p>
                  </td>
                  <td className="py-5 px-6 text-right text-gray-600 font-medium">{owner.sessionCount}</td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${owner.successRate > 60 ? 'bg-success' : 'bg-warning'}`} 
                          style={{ width: `${owner.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-darkText">{owner.successRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right font-bold text-darkText">
                    {owner.revenue.toLocaleString()} VNĐ
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button className="p-1.5 hover:bg-white rounded-full transition-shadow shadow-none hover:shadow-sm">
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-primary" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOwner && (
        <div className="bg-white p-6 rounded-xl border-2 border-accent/20 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-2 h-8 bg-accent rounded-full" />
              Chi tiết: {owners.find(o => o.id === selectedOwner)?.name}
            </h3>
            <button onClick={() => setSelectedOwner(null)} className="text-sm text-gray-400 hover:text-danger">Đóng chi tiết</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Giá trị thặng dư</p>
              <p className="text-xl font-bold text-success">+ 24.5%</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Thời gian niêm yết TB</p>
              <p className="text-xl font-bold text-darkText">12.4 ngày</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Người đăng ký/Phiên TB</p>
              <p className="text-xl font-bold text-primary">8.2 người</p>
            </div>
          </div>

          <div className="text-center py-12 text-gray-400 italic">
            <p>Bảng danh sách các phiên đấu giá cụ thể cho chủ tài sản này sẽ được hiển thị tại đây.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAnalysis;
