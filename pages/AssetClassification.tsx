
import React from 'react';
import { AuctionSession, Asset, AssetType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Treemap } from 'recharts';

interface AssetClassificationProps {
  data: {
    sessions: AuctionSession[];
    assets: Asset[];
  };
}

const COLORS = ['#0F6CBD', '#1F8CEB', '#2CB44E', '#FFB200'];

const AssetClassification: React.FC<AssetClassificationProps> = ({ data }) => {
  const { sessions, assets } = data;

  // Group assets by type
  const typeDistribution = Object.values(AssetType).map(type => {
    const assetList = assets.filter(a => a.asset_type === type);
    const relatedSessions = sessions.filter(s => {
      const asset = assetList.find(a => a.asset_id === s.asset_id);
      return !!asset;
    });
    
    return {
      name: type,
      value: assetList.length,
      revenue: relatedSessions.reduce((acc, curr) => acc + curr.revenue, 0),
      sessionCount: relatedSessions.length
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-darkText">Phân tích Phân loại Tài sản</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">Tổng: {assets.length} tài sản</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-darkText">Phân bổ theo loại tài sản (Số lượng)</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-darkText">Chi tiết giá trị & Doanh thu</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase font-bold">
                  <th className="pb-4 px-2">Loại tài sản</th>
                  <th className="pb-4 px-2 text-right">Số lượng</th>
                  <th className="pb-4 px-2 text-right">Số phiên</th>
                  <th className="pb-4 px-2 text-right">Doanh thu (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {typeDistribution.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 group">
                    <td className="py-4 px-2 font-medium text-darkText">{row.name}</td>
                    <td className="py-4 px-2 text-right text-gray-600">{row.value}</td>
                    <td className="py-4 px-2 text-right text-gray-600">{row.sessionCount}</td>
                    <td className="py-4 px-2 text-right font-bold text-accent">{row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">💡 Insight: Nhóm <span className="font-bold underline">Bất động sản</span> đang dẫn đầu về giá trị mang lại mặc dù số lượng phiên ít hơn Sim số.</p>
          </div>
        </div>
      </div>

      {/* Value Treemap Simulation */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 text-darkText">Heatmap: Doanh thu theo loại tài sản</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={typeDistribution}
              dataKey="revenue"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#0F6CBD"
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssetClassification;
