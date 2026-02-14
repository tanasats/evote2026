'use client'
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, Vote, School, Activity, TrendingUp } from 'lucide-react';

// Mock Data (ในอนาคตจะดึงจาก API)
const participationData = [
  { name: 'วิศวกรรมฯ', voted: 450, total: 600 },
  { name: 'บัญชีฯ', voted: 520, total: 550 },
  { name: 'ศิลปกรรมฯ', voted: 300, total: 400 },
  { name: 'วิทยาศาสตร์', voted: 380, total: 500 },
  { name: 'พยาบาลฯ', voted: 190, total: 200 },
];

const statusData = [
  { name: 'โหวตแล้ว', value: 1840, color: '#2563eb' },
  { name: 'ยังไม่โหวต', value: 410, color: '#e2e8f0' },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard สรุปผล</h1>
        <p className="text-slate-500 font-medium">ข้อมูลสถิติการเลือกตั้งแบบ Real-time</p>
      </div>

      {/* --- Stat Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="ผู้มาใช้สิทธิ์ทั้งหมด" value="1,840" subValue="+12% จากชั่วโมงที่แล้ว" icon={<Users className="text-blue-600" />} />
        <StatCard title="ร้อยละการใช้สิทธิ์" value="81.7%" subValue="จากนิสิตที่มีสิทธิ์ทั้งหมด" icon={<TrendingUp className="text-green-600" />} />
        <StatCard title="จำนวนคณะ" value="18/20" subValue="ส่งข้อมูลครบแล้ว 18 คณะ" icon={<School className="text-amber-600" />} />
        <StatCard title="สถานะระบบ" value="เปิดปกติ" subValue="Server Load: 12%" icon={<Activity className="text-emerald-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- กราฟแท่ง (Bar Chart) --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
             <School size={20} className="text-blue-500" /> สถิติผู้มาใช้สิทธิ์รายคณะ
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="voted" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- กราฟวงกลม (Pie Chart) --- */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-2">ภาพรวมสิทธิ์</h3>
          <p className="text-xs text-slate-400 font-bold uppercase mb-6">Voting Participation</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={statusData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={8} 
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-10 text-center">
                <span className="block text-2xl font-black text-slate-800">81%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Voted</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">เป้าหมาย (90%)</span>
                <span className="text-slate-900 font-black">ขาดอีก 210 คน</span>
             </div>
             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '81%' }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component สำหรับ Stat Card
function StatCard({ title, value, subValue, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-3xl font-black text-slate-900 mb-1">{value}</h2>
      <p className="text-xs text-slate-400 font-medium">{subValue}</p>
    </div>
  );
}