'use client'
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, UserCheck, PieChart, BarChart3, TrendingUp,
  AlertCircle, RefreshCw, Loader2, LayoutGrid,
  List, Search, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import adminService, { DashboardStats } from '@/services/adminService';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // View States
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Data Fetching ---
  const fetchStats = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
      console.log(data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลสถิติได้');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(false), 30000); // Auto-refresh ทุก 30 วินาที
    return () => clearInterval(interval);
  }, [fetchStats]);

  // --- Filtering Logic ---
  const filteredFaculties = useMemo(() => {
    return stats?.faculty_stats?.filter((f: any) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [stats, searchTerm]);

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-500 font-black animate-pulse">กำลังรวบรวมคะแนนจากทุกคูหา...</p>
    </div>
  );

  if (!stats) return null;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">

      {/* --- Header & Summary Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ศูนย์ควบคุมการเลือกตั้ง</h1>
          <p className="text-slate-500 font-medium italic">อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')} น.</p>
        </div>
        <button
          onClick={() => fetchStats(false)}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all active:scale-95"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'กำลังปรับปรุง...' : 'Refresh Data'}
        </button>
      </div>

      {/* --- Top Metrics Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={<Users className="text-blue-600" />}
          label="จำนวนผู้มีสิทธิ์ทั้งหมด"
          value={stats.summary.total_students.toLocaleString()}
          unit="คน"
          sub="ข้อมูลจากฐานข้อมูลนิสิต"
          color="blue"
        />
        <MetricCard
          icon={<UserCheck className="text-emerald-600" />}
          label="มาใช้สิทธิ์แล้ว"
          value={stats.summary.total_voted.toLocaleString()}
          unit="คน"
          sub={`คิดเป็น ${stats.summary.turnout_percent}% ของทั้งหมด`}
          color="emerald"
        />
        <MetricCard
          icon={<PieChart className="text-amber-600" />}
          label="ยังไม่มาใช้สิทธิ์"
          value={stats.summary.total_unvoted.toLocaleString()}
          unit="คน"
          sub={`ต้องการอีก ${(stats.summary.total_students * 0.5 - stats.summary.total_voted > 0 ? (stats.summary.total_students * 0.5 - stats.summary.total_voted).toFixed(0) : 0)} คน เพื่อถึงเป้า 50%`}
          color="amber"
        />
      </div>

      {/* --- Hourly Velocity Chart --- */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" /> สถิติการลงคะแนนรายชั่วโมง (วันนี้)
          </h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.hourly_stats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Faculty Target Section --- */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="text-blue-600" /> สถานะเป้าหมายรายคณะ (เป้าหมายร้อยละ 20)
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Faculty Progress Monitoring</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="ค้นหาชื่อคณะ..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFaculties.map((fac: any) => (
              <FacultyProgressCard key={fac.faculty_code} faculty={fac} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">คณะ</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">มาใช้สิทธิ์ / ทั้งหมด</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ร้อยละ</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานะนผู้มาใช้สิทธิ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFaculties.map((fac: any) => (
                  <tr key={fac.faculty_code} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-800">{fac.name}</td>
                    <td className="px-8 py-5 text-center font-mono font-bold text-slate-500">
                      <span className="text-slate-900">{fac.voted.toLocaleString()}</span> / {fac.total.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`font-black ${fac.percent >= 20 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {fac.percent}%
                      </span>
                    </td>
                    <td className="px-8 py-5 min-w-[240px]">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full transition-all duration-1000 ${fac.percent >= 20 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((fac.percent), 100)}%` }}
                          />
                        </div>
                        {/* <span className="text-[10px] font-black text-slate-400 w-10">
                          {Math.min((fac.percent), 100).toFixed(0)}%
                        </span> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub Components ---

function MetricCard({ icon, label, value, unit, sub, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
      <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="relative z-10">
        <div className={`p-4 rounded-2xl inline-block bg-${color}-50 mb-6 group-hover:rotate-6 transition-transform`}>
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <h4 className="text-4xl font-black text-slate-900">{value}</h4>
          <span className="text-sm font-bold text-slate-400">{unit}</span>
        </div>
        <p className="text-xs font-bold text-slate-400 mt-4 italic">{sub}</p>
      </div>
    </div>
  );
}

function FacultyProgressCard({ faculty }: { faculty: any }) {
  const isGoalReached = faculty.percent >= 20;
  // Progress bar logic: 100% of bar = 50% turnout
  const progressToGoal = Math.min((faculty.percent), 100);

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${isGoalReached ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          <Users size={20} />
        </div>
        {isGoalReached ? (
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-[10px] font-black border border-emerald-100 animate-in zoom-in duration-500">
            <CheckCircle2 size={12} strokeWidth={3} /> REACHED 50%
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-4 py-1.5 rounded-full text-[10px] font-black border border-blue-100">
            <TrendingUp size={12} strokeWidth={3} /> IN PROGRESS
          </div>
        )}
      </div>

      <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight line-clamp-1">{faculty.name}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">รหัสคณะ: {faculty.faculty_code || 'N/A'}</p>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">จำนวนผู้มาโหวต</p>
            <p className="text-2xl font-black text-slate-900">
              {faculty.voted.toLocaleString()}
              <span className="text-sm text-slate-300 ml-1.5 font-bold">/ {faculty.total.toLocaleString()}</span>
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ร้อยละ</p>
            <p className={`text-2xl font-black ${isGoalReached ? 'text-emerald-600' : 'text-blue-600'}`}>
              {faculty.percent}%
            </p>
          </div>
        </div>

        {/* Progress Logic: Target 50% focus */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-700">0%</span>
            <span className="text-slate-700">100%</span>
          </div>
          <div className="relative w-full h-5 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-1">
            <div
              className={`h-full rounded-xl transition-all duration-1000 shadow-sm ${isGoalReached ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-500 shadow-blue-200'}`}
              style={{ width: `${progressToGoal}%` }}
            />
          </div>
          {faculty.percent < 20 ? (
            <div className="flex items-center gap-1.5 justify-end text-red-500">
              <span className='text-[12px] font-black italic'>เป้าหมาย 20%</span>
              <AlertCircle size={10} />
              <span className="text-[12px] font-black italic">ขาดอีก {Math.ceil((faculty.total * 0.2) - faculty.voted).toLocaleString()} คน</span>
            </div>
          ) : (
            <p className="text-[12px] text-emerald-500 font-black italic text-right flex items-center gap-1 justify-end">
              <ArrowUpRight size={10} /> เกินเป้าหมายขั้นต่ำแล้ว
            </p>
          )}
        </div>
      </div>
    </div>
  );
}