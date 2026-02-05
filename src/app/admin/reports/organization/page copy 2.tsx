'use client'
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Printer, 
  Loader2, 
  AlertCircle,
  RefreshCcw,
  Users,
  Vote,
  BarChart2,
  PieChart
} from 'lucide-react';
import { reportService } from '@/services/reportService';

interface OrgReport {
  faculty: string;
  total_eligible: number;
  voted: number;
  no_vote: number;
  candidate_1: number;
  candidate_2: number;
  candidate_3: number;
}

export default function OrganizationReport() {
  const [data, setData] = useState<OrgReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);








  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      //const response = await fetch('http://localhost:3001/api/v1/admin/reports/organization');
      const data = await reportService.getReportOrganization();

      //if (!response.ok) {
      //  throw new Error('ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้');
      //}
      //const result = await response.json();
      setData(data);

    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);










  
  const totals = data.reduce((acc, curr) => ({
    total_eligible: acc.total_eligible + curr.total_eligible,
    voted: acc.voted + curr.voted,
    no_vote: acc.no_vote + curr.no_vote,
    candidate_1: acc.candidate_1 + curr.candidate_1,
    candidate_2: acc.candidate_2 + curr.candidate_2,
    candidate_3: acc.candidate_3 + curr.candidate_3,
  }), { total_eligible: 0, voted: 0, no_vote: 0, candidate_1: 0, candidate_2: 0, candidate_3: 0 });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      ...data.map(item => ({
        'คณะ': item.faculty,
        'ผู้มีสิทธิ์': item.total_eligible,
        'มาใช้สิทธิ์': item.voted,
        'ร้อยละการใช้สิทธิ์': ((item.voted / item.total_eligible) * 100).toFixed(2),
        'เบอร์ 1': item.candidate_1,
        'เบอร์ 2': item.candidate_2,
        'เบอร์ 3': item.candidate_3,
        'ไม่ประสงค์ลงคะแนน': item.no_vote
      })),
      {
        'คณะ': 'รวมทุกคณะ',
        'ผู้มีสิทธิ์': totals.total_eligible,
        'มาใช้สิทธิ์': totals.voted,
        'ร้อยละการใช้สิทธิ์': ((totals.voted / totals.total_eligible) * 100).toFixed(2),
        'เบอร์ 1': totals.candidate_1,
        'เบอร์ 2': totals.candidate_2,
        'เบอร์ 3': totals.candidate_3,
        'ไม่ประสงค์ลงคะแนน': totals.no_vote
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "องค์การนิสิต");
    XLSX.writeFile(workbook, `Org_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-bold tracking-tight">กำลังคำนวณคะแนนองค์การนิสิต...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center bg-red-50 rounded-[3rem] border border-red-100 max-w-2xl mx-auto">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h3 className="text-xl font-black text-red-900">การดึงข้อมูลขัดข้อง</h3>
      <p className="text-red-600 mb-6 font-medium">{error}</p>
      <button onClick={fetchReportData} className="bg-white text-red-600 px-6 py-2 rounded-2xl border border-red-200 font-bold shadow-sm flex items-center gap-2 mx-auto">
        <RefreshCcw size={18} /> ลองใหม่อีกครั้ง
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">รายงานผลการลงคะแนน: องค์การนิสิต</h1>
          <p className="text-slate-500 font-medium">ภาพรวมสถิติการเลือกตั้งและคะแนนเสียงแยกตามคณะ</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/10 active:scale-95">
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            <Printer size={18} /> พิมพ์
          </button>
        </div>
      </div>

      {/* --- Quick Stats Bento Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="มาใช้สิทธิ์รวม" value={totals.voted.toLocaleString()} unit="คน" icon={<Vote className="text-blue-600"/>} color="blue" />
        <SummaryCard title="ร้อยละการใช้สิทธิ์" value={((totals.voted / totals.total_eligible) * 100).toFixed(1)} unit="%" icon={<Users className="text-purple-600"/>} color="purple" />
        <SummaryCard title="คะแนนนำสูงสุด" value={Math.max(totals.candidate_1, totals.candidate_2, totals.candidate_3).toLocaleString()} unit="โหวต" icon={<BarChart2 className="text-amber-600"/>} color="amber" />
        <SummaryCard title="ไม่ประสงค์ลงคะแนน" value={totals.no_vote.toLocaleString()} unit="คน" icon={<PieChart className="text-slate-600"/>} color="slate" />
      </div>

      {/* --- Main Table Section --- */}
      
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400">
                <th className="p-6 text-xs font-black uppercase tracking-widest">ชื่อคณะ</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-center">มาใช้สิทธิ์ (%)</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-center bg-blue-50/30">เบอร์ 1</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-center bg-blue-50/30">เบอร์ 2</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-center bg-blue-50/30">เบอร์ 3</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-center">ไม่ประสงค์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-6 font-bold text-slate-900">{item.faculty}</td>
                  <td className="p-6 text-center">
                    <div className="text-sm font-black text-slate-800">{item.voted.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-400">จาก {item.total_eligible.toLocaleString()} ({((item.voted / item.total_eligible) * 100).toFixed(1)}%)</div>
                  </td>
                  {/* แสดงคะแนนพร้อมขีดความกว้าง (Visual Indicator) */}
                  {[item.candidate_1, item.candidate_2, item.candidate_3].map((score, i) => (
                    <td key={i} className="p-6 text-center bg-blue-50/5 relative">
                      <div className="relative z-10 text-sm font-black text-blue-900">{score.toLocaleString()}</div>
                      <div className="absolute bottom-2 left-4 right-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 opacity-30" style={{ width: `${item.voted > 0 ? (score / item.voted) * 100 : 0}%` }}></div>
                      </div>
                    </td>
                  ))}
                  <td className="p-6 text-sm font-medium text-slate-500 text-center">{item.no_vote.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white">
              <tr className="font-bold">
                <td className="p-6 rounded-bl-[2.5rem]">ผลรวมภาพรวม</td>
                <td className="p-6 text-center">
                  <div className="text-lg">{totals.voted.toLocaleString()}</div>
                  <div className="text-[10px] opacity-50 uppercase tracking-tighter">({((totals.voted / totals.total_eligible) * 100).toFixed(1)}%)</div>
                </td>
                {[totals.candidate_1, totals.candidate_2, totals.candidate_3].map((totalScore, i) => (
                  <td key={i} className="p-6 text-center bg-blue-950/50">
                    <div className="text-lg text-blue-400">{totalScore.toLocaleString()}</div>
                    <div className="text-[10px] opacity-40 uppercase">คะแนนรวม</div>
                  </td>
                ))}
                <td className="p-6 text-center rounded-br-[2.5rem] opacity-70">{totals.no_vote.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-component สำหรับ Stat Card
function SummaryCard({ title, value, unit, icon, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-50 text-slate-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">{value}</span>
          <span className="text-xs font-bold text-slate-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}