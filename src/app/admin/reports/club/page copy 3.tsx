'use client'
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Vote, 
  Trophy, 
  AlertCircle,
  RefreshCcw,
  BarChart3,
  FileSpreadsheet,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { reportService } from '@/services/reportService';

// --- Interfaces ---
interface CandidateScore {
  candidate_id: number;
  candidate_name: string;
  candidate_number: number;
  score: number;
}

interface FacultyClubReport {
  faculty_code: string;
  faculty: string;
  total_eligible: number;
  voted: number;
  no_vote: number;
  candidates: CandidateScore[] | null;
}

export default function ClubReport() {
  const [data, setData] = useState<FacultyClubReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);

  // 1. Fetch Data from API
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getReportClub();
      setData(data);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // 2. Export to Excel Function (Flattened Data for Pivot Table)
  const exportToExcel = () => {
    const exportData: any[] = [];

    data.forEach((item) => {
      const participationRate = item.total_eligible > 0 ? ((item.voted / item.total_eligible) * 100).toFixed(2) : "0.00";
      
      // เพิ่มข้อมูลผู้สมัครแต่ละพรรค
      if (item.candidates && item.candidates.length > 0) {
        item.candidates.forEach((can) => {
          const votePercent = item.voted > 0 ? ((can.score / item.voted) * 100).toFixed(2) : "0.00";
          exportData.push({
            'รหัสคณะ': item.faculty_code,
            'ชื่อคณะ': item.faculty,
            'ผู้มีสิทธิ์ทั้งหมด': item.total_eligible,
            'มาใช้สิทธิ์ (คน)': item.voted,
            'ร้อยละการใช้สิทธิ์': participationRate,
            'ประเภท': 'ผู้สมัคร/พรรค',
            'เบอร์': can.candidate_number,
            'ชื่อพรรค/ผู้สมัคร': can.candidate_name,
            'คะแนนที่ได้': can.score,
            'คิดเป็นร้อยละเทียบผู้มาใช้สิทธิ์': votePercent
          });
        });
      }

      // เพิ่มแถวไม่ประสงค์ลงคะแนน
      exportData.push({
        'รหัสคณะ': item.faculty_code,
        'ชื่อคณะ': item.faculty,
        'ผู้มีสิทธิ์ทั้งหมด': item.total_eligible,
        'มาใช้สิทธิ์ (คน)': item.voted,
        'ร้อยละการใช้สิทธิ์': participationRate,
        'ประเภท': 'ไม่ประสงค์ลงคะแนน',
        'เบอร์': '-',
        'ชื่อพรรค/ผู้สมัคร': '-',
        'คะแนนที่ได้': item.no_vote,
        'คิดเป็นร้อยละเทียบผู้มาใช้สิทธิ์': item.voted > 0 ? ((item.no_vote / item.voted) * 100).toFixed(2) : "0.00"
      });
      
      exportData.push({}); // เว้นบรรทัดว่างใน Excel เพื่อแยกคณะ
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "คะแนนสโมสรนิสิต");
    XLSX.writeFile(workbook, `Club_Election_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-500 font-bold">กำลังประมวลผลคะแนนสโมสรนิสิต...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-red-50 rounded-4xl border border-red-100">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h3 className="text-lg font-black text-red-900">เกิดข้อผิดพลาด</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchReport} className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-xl border border-red-200 font-bold hover:bg-red-50">
        <RefreshCcw size={18} /> ลองใหม่อีกครั้ง
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ผลการเลือกตั้ง สโมสรนิสิต</h1>
          <p className="text-slate-500 font-medium">สรุปผลคะแนนรายพรรคและสถิติการใช้สิทธิ์แยกตามคณะ</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white"><BarChart3 size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase leading-none">สถานะปัจจุบัน</p>
            <p className="text-sm font-bold text-blue-700">คำนวณจาก {data.length} คณะ</p>
          </div>
        </div>
      </div>



        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
          >
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            <Printer size={18} /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid gap-4">
        {data.map((item) => {
          const participationRate = item.total_eligible > 0 ? (item.voted / item.total_eligible) * 100 : 0;
          
          return (
            <div key={item.faculty_code} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              {/* Card Header */}
              <div 
                onClick={() => setExpandedFaculty(expandedFaculty === item.faculty_code ? null : item.faculty_code)}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold leading-none mb-1">CODE</span>
                    <span className="text-lg font-black leading-none">{item.faculty_code}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{item.faculty}</h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Users size={14} className="text-slate-600" /> สิทธิ์: {item.total_eligible.toLocaleString()} คน
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                        <Vote size={14} /> ใช้สิทธิ์: {item.voted.toLocaleString()} ({participationRate.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-50">
                  <div className="hidden sm:block w-32">
                    <div className="flex justify-between text-[12px] font-black mb-1.5">
                      <span className="text-slate-400">PERCENTAGE</span>
                      <span className="text-slate-900">{participationRate.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${participationRate}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                       <span className="text-[12px] font-black text-slate-400 uppercase block">Candidates</span>
                       <span className="text-sm font-black text-slate-700">{item.candidates?.length || 0} พรรค</span>
                    </div>
                    <div className={`p-2.5 rounded-full transition-all duration-300 ${expandedFaculty === item.faculty_code ? 'bg-slate-900 text-white rotate-0' : 'bg-slate-50 text-slate-400'}`}>
                      {expandedFaculty === item.faculty_code ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                  </div>
                </div>

              </div>

              {/* Expanded Detail Area */}
              {expandedFaculty === item.faculty_code && (
                <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                  {item.candidates && item.candidates.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {item.candidates.map((can) => {
                          const votePercent = item.voted > 0 ? (can.score / item.voted) * 100 : 0;
                          return (
                            <div key={can.candidate_id} className="bg-white p-5 rounded-3xl border border-white shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-colors">
                              <div className="flex justify-between items-start mb-5">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                                  {can.candidate_number}
                                </div>
                                <div className="text-right">
                                  <p className="text-3xl font-black text-slate-900 leading-none">{can.score.toLocaleString()}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">คะแนนโหวต</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm mb-3 line-clamp-1">{can.candidate_name}</h4>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${votePercent}%` }} />
                                </div>
                                <p className="text-[10px] font-bold text-blue-600">สัดส่วนคะแนน {votePercent.toFixed(1)}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Abstain Summary */}
                      <div className="flex items-center justify-between p-5 bg-white/60 rounded-3xl border border-dashed border-slate-200 mt-2">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center"><Vote size={20}/></div>
                            <div>
                               <span className="text-xs font-bold text-slate-500 block leading-none">Abstain</span>
                               <span className="text-sm font-black text-slate-600">ไม่ประสงค์ลงคะแนน</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-xl font-black text-slate-600">{item.no_vote.toLocaleString()}</span>
                            <span className="ml-1 text-xs font-bold text-slate-400 italic">คะแนน</span>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                       <Trophy size={48} className="mx-auto text-slate-100 mb-4" />
                       <h4 className="text-slate-800 font-bold">ไม่มีข้อมูลผู้สมัคร</h4>
                       <p className="text-slate-400 text-sm italic">คณะนี้ไม่มีพรรคการเมืองที่สมัครรับเลือกตั้งในปีนี้</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

            {/* Faculty Cards ----------------------------------*/}
            <div className="grid gap-4">
                {data.map((item) => (
                    <div key={item.faculty_code} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                        {/* Header Card (Summary) */}
                        <div
                            onClick={() => setExpandedFaculty(expandedFaculty === item.faculty_code ? null : item.faculty_code)}
                            className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-ballot-blue text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{item.faculty}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Users size={14} /> ผู้มีสิทธิ์: {item.total_eligible}</span>
                                        <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-indigo-50 px-2 py-0.5 rounded-md"><Vote size={14} /> มาใช้สิทธิ์: {item.voted} ({((item.voted / item.total_eligible) * 100).toFixed(1)}%)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 self-end lg:self-center">
                                {item.candidates && item.candidates.length > 0 && (
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Candidates</span>
                                        <span className="text-sm font-black text-slate-700"><span className='text-2xl'>{item.candidates?.length || 0}</span> คน</span>
                                    </div>
                                )}
                                <div className={`p-2 rounded-full transition-all ${expandedFaculty === item.faculty_code ? 'bg-ballot-blue text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    {expandedFaculty === item.faculty_code ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            
                        </div>

                        {/* Expanded Content (Details) */}
                        {expandedFaculty === item.faculty_code && (
                            <div className="px-6 pb-8 pt-2 bg-slate-50/50 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                                {item.candidates && item.candidates.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                        {item.candidates.map((can: any) => {
                                            // คำนวณร้อยละเทียบกับ "จำนวนผู้มาใช้สิทธิ์"
                                            const voteRate = item.voted > 0 ? ((can.score / item.voted) * 100).toFixed(1) : 0;
                                            return (
                                                <div key={can.candidate_id} className="bg-white p-5 rounded-3xl border border-white shadow-sm hover:border-indigo-100 transition-colors group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="w-10 h-10 bg-indigo-100 text-ballot-blue rounded-xl flex items-center justify-center font-black group-hover:bg-ballot-blue group-hover:text-white transition-all">
                                                            {can.candidate_number}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black text-slate-900 leading-none">{can.score.toLocaleString()}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">คะแนนโหวต</p>
                                                        </div>
                                                    </div>
                                                    <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{can.candidate_name}</h4>
                                                    <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${voteRate}%` }} />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-indigo-500 mt-2 italic">ความนิยม {voteRate}% ของผู้ใช้สิทธิ์</p>
                                                </div>
                                            );
                                        })}
                                        {/* Abstain Card */}
                                        <div className="bg-slate-100/50 p-5 rounded-3xl border border-dashed border-slate-200 flex flex-col justify-center items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">ไม่ประสงค์ลงคะแนน</span>
                                            <p className="text-2xl font-black text-slate-600 mt-1">{item.no_vote.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center bg-white rounded-4xl border border-dashed border-slate-200 mt-4">
                                        <AlertCircle className="mx-auto text-slate-200 mb-2" size={40} />
                                        <p className="text-slate-400 italic">-- ไม่มีผู้สมัคร --</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>





      <div className="pt-4 text-center">
        {/* <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          End of Official Report
        </div> */}
        <p className="text-[14px] text-slate-400 mt-2 italic">ข้อมูลเมื่อ {new Date().toLocaleString('th-TH')}</p>
      </div>
    </div>
  );
}