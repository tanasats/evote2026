'use client'
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Vote, School, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [summaryData, setSummaryData] = useState<any>(null);

  // ในสถานการณ์จริง ควรใช้ SWR หรือ React Query เพื่อทำ Auto-refresh ทุกๆ 30 วินาที
  useEffect(() => {
    // fetchData();
  }, []);

  // ข้อมูลสมมติสำหรับแสดงผลกราฟ
  const chartData = [
    { name: 'หมายเลข 1', votes: 12500 },
    { name: 'หมายเลข 2', votes: 9800 },
    { name: 'หมายเลข 3', votes: 4200 },
    { name: 'ไม่ประสงค์ลงคะแนน', votes: 1500 },
  ];

  const COLORS = ['#3b82f6', '#f472b6', '#fbbf24', '#9ca3af'];

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Election Real-time Dashboard</h1>
          <p className="text-gray-500">ข้อมูลอัปเดตล่าสุด: {new Date().toLocaleTimeString()}</p>
        </div>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
          รีเฟรชข้อมูล
        </button>
      </header>

      {/* สถิติตัวเลข (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users size={24}/>} label="ผู้มีสิทธิ์ทั้งหมด" value="40,000" color="blue" />
        <StatCard icon={<Vote size={24}/>} label="มาใช้สิทธิ์แล้ว" value="28,540" color="green" />
        <StatCard icon={<School size={24}/>} label="คิดเป็นร้อยละ" value="71.35%" color="purple" />
        <StatCard icon={<AlertCircle size={24}/>} label="ยังไม่ใช้สิทธิ์" value="11,460" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* กราฟแท่งแสดงผลคะแนนองค์การนิสิต */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-700">ผลคะแนน: องค์การนิสิต (รวมทั่งมหาวิทยาลัย)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="votes" radius={[0, 10, 10, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ตารางแสดงผลแยกรายคณะ */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-700">การมาใช้สิทธิ์แยกตามคณะ (%)</h2>
          <div className="overflow-y-auto h-80">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white">
                <tr className="text-gray-400 text-sm uppercase">
                  <th className="pb-4">คณะ</th>
                  <th className="pb-4 text-right">ร้อยละการใช้สิทธิ์</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 divide-y divide-gray-100">
                <FacultyRow name="วิศวกรรมศาสตร์" percent={82} />
                <FacultyRow name="บัญชีและการจัดการ" percent={65} />
                <FacultyRow name="มนุษยศาสตร์ฯ" percent={58} />
                <FacultyRow name="วิทยาศาสตร์" percent={74} />
                <FacultyRow name="สาธารณสุขศาสตร์" percent={91} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

// Sub-components
function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function FacultyRow({ name, percent }: { name: string, percent: number }) {
  return (
    <tr>
      <td className="py-4 font-medium">{name}</td>
      <td className="py-4 text-right">
        <div className="flex items-center justify-end gap-3">
          <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${percent}%` }}></div>
          </div>
          <span className="font-bold text-gray-800">{percent}%</span>
        </div>
      </td>
    </tr>
  );
}