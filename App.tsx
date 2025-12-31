
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileCheck, 
  TrendingUp, 
  Filter, 
  ChevronDown, 
  Calendar,
  Search,
  MoreVertical,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { startOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { generateMockData } from './data/mockData';
import { FilterState, AssetType, SessionStatus } from './types';

// Page Components
import Overview from './pages/Overview';
import AssetClassification from './pages/AssetClassification';
import OwnerAnalysis from './pages/OwnerAnalysis';
import Performance from './pages/Performance';
import ApprovalWorkflow from './pages/ApprovalWorkflow';

const { assets, sessions, docs, owners } = generateMockData();

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: startOfMonth(subMonths(new Date(), 1)),
      end: new Date()
    },
    assetType: Object.values(AssetType),
    ownerId: owners.map(o => o.id),
    sessionStatus: Object.values(SessionStatus)
  });

  const filteredData = useMemo(() => {
    const filteredSessions = sessions.filter(s => {
      const asset = assets.find(a => a.asset_id === s.asset_id);
      if (!asset) return false;
      
      const inDateRange = isWithinInterval(s.start_time, { 
        start: filters.dateRange.start, 
        end: filters.dateRange.end 
      });
      const inType = filters.assetType.includes(asset.asset_type);
      const inOwner = filters.ownerId.includes(asset.owner_id);
      const inStatus = filters.sessionStatus.includes(s.session_status);
      
      return inDateRange && inType && inOwner && inStatus;
    });

    const filteredDocs = docs.filter(d => {
      const asset = assets.find(a => a.asset_id === d.asset_id);
      if (!asset) return false;
      return isWithinInterval(d.submitted_at, { 
        start: filters.dateRange.start, 
        end: filters.dateRange.end 
      });
    });

    return { 
      sessions: filteredSessions, 
      docs: filteredDocs, 
      assets: assets,
      owners: owners 
    };
  }, [filters]);

  return (
    <HashRouter>
      <div className="flex h-screen bg-neutralBg overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-[#0A2540] text-white transition-all duration-300 flex-shrink-0 flex flex-col ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="p-6 flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-bold text-lg">D</div>
                <span className="font-bold text-xl tracking-tight whitespace-nowrap">DaugiaVNA</span>
              </div>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-700 rounded transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} className="mx-auto" />}
            </button>
          </div>

          <nav className="mt-4 flex-1">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Tổng quan" isOpen={isSidebarOpen} />
            <NavItem to="/assets" icon={<Package size={20} />} label="Phân loại tài sản" isOpen={isSidebarOpen} />
            <NavItem to="/owners" icon={<Users size={20} />} label="Chủ tài sản" isOpen={isSidebarOpen} />
            <NavItem to="/performance" icon={<TrendingUp size={20} />} label="Hiệu quả phiên" isOpen={isSidebarOpen} />
            <NavItem to="/approvals" icon={<FileCheck size={20} />} label="Phê duyệt" isOpen={isSidebarOpen} />
          </nav>

          <div className="p-4 border-t border-slate-700">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
              <img src="https://picsum.photos/40/40" className="w-10 h-10 rounded-full border-2 border-accent" />
              {isSidebarOpen && (
                <div>
                  <p className="font-medium text-sm">Admin AI/BI</p>
                  <p className="text-xs text-slate-400">admin@daugiavna.vn</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-darkText">Dashboard Quản trị Đấu giá</h1>
              <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md text-sm text-gray-600">
                <Calendar size={14} />
                <span>Tháng trước - Hiện tại</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm phiên, tài sản..." 
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button className="relative text-gray-500 hover:text-primary transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-[10px] text-white flex items-center justify-center rounded-full font-bold">3</span>
              </button>
              <button className="text-gray-500 hover:text-primary">
                <MoreVertical size={20} />
              </button>
            </div>
          </header>

          {/* Sub-Header / Filters */}
          <div className="bg-[#0F6CBD] text-white px-8 py-4 flex flex-wrap items-center gap-4 shadow-md">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter size={16} />
              <span>Bộ lọc:</span>
            </div>
            
            <FilterSelect 
              label="Loại tài sản" 
              options={Object.values(AssetType)} 
              value={filters.assetType}
              onChange={(val) => setFilters(f => ({ ...f, assetType: val as AssetType[] }))}
            />
            
            <FilterSelect 
              label="Trạng thái" 
              options={Object.values(SessionStatus)} 
              value={filters.sessionStatus}
              onChange={(val) => setFilters(f => ({ ...f, sessionStatus: val as SessionStatus[] }))}
            />

            <div className="ml-auto flex items-center gap-3">
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-all border border-white/20">
                Lưu báo cáo
              </button>
              <button className="bg-accent hover:bg-accent/90 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all">
                Xuất dữ liệu PDF
              </button>
            </div>
          </div>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Overview data={filteredData} />} />
              <Route path="/assets" element={<AssetClassification data={filteredData} />} />
              <Route path="/owners" element={<OwnerAnalysis data={filteredData} />} />
              <Route path="/performance" element={<Performance data={filteredData} />} />
              <Route path="/approvals" element={<ApprovalWorkflow data={filteredData} />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-4 px-6 py-4 transition-all hover:bg-accent group ${
        isActive ? 'bg-accent text-white border-r-4 border-white' : 'text-slate-300'
      }`}
    >
      <span className={`${isActive ? 'text-white' : 'group-hover:text-white transition-colors'}`}>
        {icon}
      </span>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

interface FilterSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-sm transition-all border border-white/20"
      >
        <span>{label}: {value.length === options.length ? 'Tất cả' : `${value.length} đã chọn`}</span>
        <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 text-darkText z-30 py-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in duration-200">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={value.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...value, opt]);
                    } else {
                      onChange(value.filter(v => v !== opt));
                    }
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
