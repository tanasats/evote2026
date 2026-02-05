'use client'
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Printer, 
  Loader2, 
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { reportService } from '@/services/reportService';

// กำหนด Interface สำหรับข้อมูลรายงาน
interface FacultyReport {
  faculty: string;
  total_eligible: number;
  voted: number;
  no_vote: number;
  candidate_1: number;
  candidate_2: number;
  candidate_3: number;
}

export default function OrganizationReport() {
  const [data, setData] = useState<FacultyReport[]>([]);
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

  // คำนวณผลรวมท้ายตาราง
  const totals = data.reduce((acc, curr) => ({
    total_eligible: acc.total_eligible + curr.total_eligible,
    voted: acc.voted + curr.voted,
    no_vote: acc.no_vote + curr.no_vote,
    candidate_1: acc.candidate_1 + curr.candidate_1,
    candidate_2: acc.candidate_2 + curr.candidate_2,
    candidate_3: acc.candidate_3 + curr.candidate_3,
  }), { 
    total_eligible: 0, voted: 0, no_vote: 0, 
    candidate_1: 0, candidate_2: 0, candidate_3: 0 
  });

  // ฟังก์ชัน Export เป็น Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      ...data.map(item => ({
        'คณะ': item.faculty,
        'ผู้มีสิทธิ์': item.total_eligible,
        'มาใช้สิทธิ์': item.voted,
        'ร้อยละการใช้สิทธิ์': item.total_eligible > 0 ? ((item.voted / item.total_eligible) * 100).toFixed(2) : "0.00",
        'เบอร์ 1': item.candidate_1,
        'เบอร์ 2': item.candidate_2,
        'เบอร์ 3': item.candidate_3,
        'ไม่ประสงค์ลงคะแนน': item.no_vote
      })),
      {
        'คณะ': 'รวมทุกคณะ',
        'ผู้มีสิทธิ์': totals.total_eligible,
        'มาใช้สิทธิ์': totals.voted,
        'ร้อยละการใช้สิทธิ์': totals.total_eligible > 0 ? ((totals.voted / totals.total_eligible) * 100).toFixed(2) : "0.00",
        'เบอร์ 1': totals.candidate_1,
        'เบอร์ 2': totals.candidate_2,
        'เบอร์ 3': totals.candidate_3,
        'ไม่ประสงค์ลงคะแนน': totals.no_vote
      }
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "สรุปผลการเลือกตั้ง");
    
    // ตั้งชื่อไฟล์ตามวันที่ดึงข้อมูล
    const fileName = `Report_Organization_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-bold">กำลังประมวลผลข้อมูลรายงาน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-red-50 rounded-[2rem] border border-red-100">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-black text-red-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p className="text-red-600 mb-6 text-center">{error}</p>
        <button 
          onClick={fetchReportData}
          className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-6 py-2 rounded-xl font-bold hover:bg-red-50 transition-all"
        >
          <RefreshCcw size={18} /> ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ผลการลงคะแนนเลือกองค์การนิสิต</h1>
          <p className="text-slate-500 text-sm font-medium">ข้อมูลจำแนกรายคณะและภาพรวม</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
          >
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <Printer size={18} /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl  border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-100">
                <th className="p-2 text-xs font-black text-slate-400 uppercase tracking-widest">คณะ</th>
                <th className="p-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center">ผู้มีสิทธิ์</th>
                <th className="p-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center">มาใช้สิทธิ์ (%)</th>
                <th className="p-2 text-xs font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50/50 border-x border-blue-50">เบอร์ 1</th>
                <th className="p-2 text-xs font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50/50 border-x border-blue-50">เบอร์ 2</th>
                <th className="p-2 text-xs font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50/50 border-x border-blue-50">เบอร์ 3</th>
                <th className="p-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center">ไม่ประสงค์โหวต</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-200/50 transition-colors group">
                  <td className="p-2 text-sm font-bold text-slate-700">{item.faculty}</td>
                  <td className="p-2 text-sm font-medium text-slate-600 text-center">{item.total_eligible.toLocaleString()}</td>
                  <td className="p-2 text-sm text-center">
                    <div className="font-black text-slate-900">{item.voted.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      {item.total_eligible > 0 ? ((item.voted / item.total_eligible) * 100).toFixed(1) : 0}%
                    </div>
                  </td>
                  <td className="p-2 text-sm font-black text-center text-blue-700 bg-blue-50/20">{item.candidate_1.toLocaleString()}</td>
                  <td className="p-2 text-sm font-black text-center text-blue-700 bg-blue-50/20">{item.candidate_2.toLocaleString()}</td>
                  <td className="p-2 text-sm font-black text-center text-blue-700 bg-blue-50/20">{item.candidate_3.toLocaleString()}</td>
                  <td className="p-2 text-sm font-medium text-slate-500 text-center">{item.no_vote.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            {/* Summary Footer */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold border-t-4 border-white">
                <td className="p-2 text-sm">รวมทุกคณะ</td>
                <td className="p-2 text-sm text-center">{totals.total_eligible.toLocaleString()}</td>
                <td className="p-2 text-sm text-center">
                  <div className="font-black">{totals.voted.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                    ({totals.total_eligible > 0 ? ((totals.voted / totals.total_eligible) * 100).toFixed(1) : 0}%)
                  </div>
                </td>
                <td className="p-2 text-sm text-center bg-blue-800">{totals.candidate_1.toLocaleString()}</td>
                <td className="p-2 text-sm text-center bg-blue-800">{totals.candidate_2.toLocaleString()}</td>
                <td className="p-2 text-sm text-center bg-blue-800">{totals.candidate_3.toLocaleString()}</td>
                <td className="p-2 text-sm text-center">{totals.no_vote.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* ประทับเวลาข้อมูล */}
      <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        ข้อมูลล่าสุดเมื่อ: {new Date().toLocaleString('th-TH')}
      </div>
    </div>
  );
}