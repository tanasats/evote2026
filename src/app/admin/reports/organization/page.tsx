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
  Trophy,
  BarChart3
} from 'lucide-react';
import { reportService } from '@/services/reportService';

interface Candidate {
  candidate_id: number;
  candidate_name: string;
  candidate_number: number;
  score: number;
}

interface OrgReport {
  faculty: string;
  total_eligible: number;
  voted: number;
  no_vote: number;
  candidates: Candidate[] | null;
}

export default function OrganizationDynamicReport() {
  const [data, setData] = useState<OrgReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getReportOrganization();
      setData(data);

    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  // คำนวณผลรวมภาพรวมทั้งมหาวิทยาลัย
  const getGrandTotal = () => {
    const totals = {
      total_eligible: 0,
      voted: 0,
      no_vote: 0,
      candidates: [] as { number: number, name: string, score: number }[]
    };
    data.forEach(faculty => {
      totals.total_eligible += faculty.total_eligible;
      totals.voted += faculty.voted;
      totals.no_vote += faculty.no_vote;

      faculty.candidates?.forEach(can => {
        const existing = totals.candidates.find(c => c.number === can.candidate_number);
        if (existing) {
          existing.score += can.score;
        } else {
          totals.candidates.push({ number: can.candidate_number, name: can.candidate_name, score: can.score });
        }
      });
    });
    return totals;
  };

  const grandTotals = getGrandTotal();

  // ฟังก์ชันสุ่มสีสำหรับ Progress Bar (หรือจะ Fix ไว้ตามเบอร์ก็ได้)
  const getBarColor = (index: number) => {
    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-cyan-600', 'bg-teal-600'];
    return colors[index % colors.length];
  };

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-bold tracking-tight">กำลังสรุปคะแนนองค์การนิสิต...</p>
    </div>
  );

  // ฟังก์ชัน Export เป็น Excel สำหรับข้อมูลแบบ Dynamic
  const exportToExcel = () => {
    const exportData: any[] = [];

    // เพิ่มบรรทัดสรุปภาพรวมมหาวิทยาลัยไว้บนสุด
    const grand = getGrandTotal();
    exportData.push({ 'ชื่อคณะ': '--- ภาพรวมทั้งมหาวิทยาลัย ---' });
    grand.candidates.forEach(c => {
      exportData.push({
        'ชื่อคณะ': 'รวมทุกคณะ',
        'ประเภทการลงคะแนน': `รวมเบอร์ ${c.number}`,
        'ชื่อผู้สมัคร/พรรค': c.name,
        'คะแนนที่ได้': c.score
      });
    });
    exportData.push({ 'ชื่อคณะ': 'รวมทุกคณะ', 'ประเภทการลงคะแนน': 'รวมไม่ประสงค์ลงคะแนน', 'คะแนนที่ได้': grand.no_vote });
    exportData.push({}); // เว้นบรรทัดก่อนขึ้นรายคณะ

    data.forEach((item) => {
      const participationRate = item.total_eligible > 0 ? ((item.voted / item.total_eligible) * 100).toFixed(2) : "0.00";

      // 1. วนลูปดึงข้อมูลผู้สมัครทุกคนของคณะนั้นๆ (Dynamic)
      if (item.candidates && item.candidates.length > 0) {
        item.candidates.forEach((can) => {
          exportData.push({
            'ชื่อคณะ': item.faculty,
            'ผู้มีสิทธิ์ทั้งหมด': item.total_eligible,
            'มาใช้สิทธิ์ (คน)': item.voted,
            'ร้อยละการใช้สิทธิ์': participationRate,
            'ประเภทการลงคะแนน': `ผู้สมัครเบอร์ ${can.candidate_number}`,
            'ชื่อผู้สมัคร/พรรค': can.candidate_name,
            'คะแนนที่ได้': can.score,
            'คิดเป็นร้อยละ (เทียบผู้มาใช้สิทธิ์)': item.voted > 0 ? ((can.score / item.voted) * 100).toFixed(2) : "0.00"
          });
        });
      }

      // 2. เพิ่มแถวไม่ประสงค์ลงคะแนนของคณะนั้น
      exportData.push({
        'ชื่อคณะ': item.faculty,
        'ผู้มีสิทธิ์ทั้งหมด': item.total_eligible,
        'มาใช้สิทธิ์ (คน)': item.voted,
        'ร้อยละการใช้สิทธิ์': participationRate,
        'ประเภทการลงคะแนน': 'ไม่ประสงค์ลงคะแนน (Abstain)',
        'ชื่อผู้สมัคร/พรรค': '-',
        'คะแนนที่ได้': item.no_vote,
        'คิดเป็นร้อยละ (เทียบผู้มาใช้สิทธิ์)': item.voted > 0 ? ((item.no_vote / item.voted) * 100).toFixed(2) : "0.00"
      });

      // เพิ่มบรรทัดว่างเพื่อให้ดูง่ายใน Excel
      exportData.push({});
    });

    // ส่วนการสร้างไฟล์ Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "สรุปผลคะแนนองค์การนิสิต");

    const fileName = `Org_Election_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };


  return (
    <div className="max-w-full mx-auto space-y-8 pb-24 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">ผลการเลือกตั้ง องค์การนิสิต</h1>
          <p className="text-slate-500 font-medium italic">รายงานสรุปคะแนนผู้สมัครแบบภาพรวมและแยกรายคณะ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReport} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
            <RefreshCcw size={20} className="text-slate-600" />
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 active:scale-95">
            <FileSpreadsheet size={18} /> <span className="hidden md:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* --- University Grand Summary Card --- */}
      <div className="bg-slate-900 rounded-4xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Trophy size={120} /></div>
        <div className="relative z-10">
          <div className="mb-8">
            {/* <h2 className="font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">สรุปคะแนนภาพรวมทั้งมหาวิทยาลัย</h2> */}
            {/* <h2 className="text-3xl text-slate-500/50 uppercase mb-2">สรุปคะแนนรวม</h2> */}
            {/* <div className="h-1 w-20 bg-blue-600 rounded-full" /> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {grandTotals.candidates.sort((a, b) => a.number - b.number).map((can, idx) => (
              <div key={idx}>
                <p className=" text-ballot-yellow uppercase mb-1 font-bold">เบอร์ {can.number}</p>
                <p className="text-4xl font-black">{can.score.toLocaleString()}</p>
                <p className="text-[12px] text-slate-200 font-bold truncate">{can.name}</p>
              </div>
            ))}

            <div >
              <p className=" text-slate-200 uppercase mb-1">ไม่ประสงค์ลงคะแนน</p>
              <p className="text-4xl font-black text-orange-500">{grandTotals.no_vote.toLocaleString()}</p>
              
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 flex justify-between flex-wrap gap-6 text-xl text-slate-200">
            <span className="flex items-center gap-2"><Users size={24} /> ผู้มีสิทธิ์:<span className='font-bold'>{grandTotals.total_eligible.toLocaleString()}</span> คน</span>
            <span className="flex items-center gap-2 text-emerald-300"><Vote size={24} /> มาใช้สิทธิ์: <span className='font-bold'>{grandTotals.voted.toLocaleString()}</span> คน ({((grandTotals.voted / grandTotals.total_eligible) * 100).toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* --- Faculty Cards List --- */}
      <div className="grid grid-cols-1 gap-6">
        {data.map((item, idx) => (
          <div key={idx} className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm transition-all hover:border-blue-100">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{item.faculty}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Faculty Statistics</p>
              </div>
              <div className='flex gap-2'>

                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <div className="text-right">
                    <p className="text-[12px]  text-slate-500 leading-none mb-1 uppercase text-center">ผู้มีสิทธิ์</p>
                    <p className="text-xl font-black text-blue-600">{item.total_eligible} </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <div className="text-right">
                    <p className="text-[12px]  text-slate-500 leading-none mb-1 uppercase text-center">ผู้มาใช้สิทธิ์</p>
                    <p className="text-xl font-black text-blue-600">{item.voted} </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <div className="text-right">
                    <p className="text-[12px]  text-slate-500 leading-none mb-1 uppercase text-center">ผู้มาใช้สิทธิ์</p>
                    <p className="text-xl font-black text-blue-600">{((item.voted / item.total_eligible) * 100).toFixed(1)}<span className='text-slate-400 text-[10px]'>%</span></p>
                  </div>
                </div>

              </div>
            </div>

            {/* Dynamic Candidates Bars */}
            <div className="space-y-4">
              {item.candidates?.map((can, canIdx) => {
                const percent = item.voted > 0 ? (can.score / item.voted) * 100 : 0;
                return (
                  <div key={can.candidate_id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-ballot-yellow text-slate-900 flex items-center justify-center text-[14px] font-black">
                          {can.candidate_number}
                        </span>
                        <span className="text-sm font-bold text-slate-700">{can.candidate_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">{can.score.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 ml-1 font-bold">({percent.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getBarColor(canIdx)} rounded-full transition-all duration-1000`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* ไม่ประสงค์ลงคะแนน (Small Bar) */}
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs font-bold text-slate-500">
                <span>ไม่ประสงค์ลงคะแนน</span>
                <span>{item.no_vote.toLocaleString()} คะแนน</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}