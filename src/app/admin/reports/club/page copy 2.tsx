'use client'
import { useState, useEffect } from 'react';
import { 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Vote, 
  Trophy, 
  AlertCircle,
  RefreshCcw,
  BarChart3
} from 'lucide-react';
import { reportService } from '@/services/reportService';

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

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-500 font-bold">กำลังประมวลผลคะแนนสโมสรนิสิต...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-red-50 rounded-[2rem] border border-red-100">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h3 className="text-lg font-black text-red-900">เกิดข้อผิดพลาด</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={fetchReport} className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-xl border border-red-200 font-bold">
        <RefreshCcw size={18} /> ลองใหม่อีกครั้ง
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">รายงานสโมสรนิสิต</h1>
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

      {/* Faculty Cards List */}
      <div className="grid gap-4">
        {data.map((item) => {
          const participationRate = item.total_eligible > 0 ? (item.voted / item.total_eligible) * 100 : 0;
          
          return (
            <div key={item.faculty_code} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              {/* --- Summary Header (Clickable) --- */}
              <div 
                onClick={() => setExpandedFaculty(expandedFaculty === item.faculty_code ? null : item.faculty_code)}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-600 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold leading-none mb-1">CODE</span>
                    <span className="text-lg font-black leading-none">{item.faculty_code}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{item.faculty}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[14px] flex items-center gap-1  text-slate-600">
                        <Users size={14} /> ผู้มีสิทธิ์: {item.total_eligible.toLocaleString()}
                      </span>
                      <span className="text-[14px] flex items-center gap-1  text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        <Vote size={14} /> มาใช้สิทธิ์: {item.voted.toLocaleString()} ({participationRate.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-8">
                  {/* Progress Bar เล็กๆ ด้านนอก */}
                  <div className="hidden sm:block w-32">
                    <div className="flex justify-between text-[12px]  mb-1">
                      <span className="text-slate-400">PARTICIPATION</span>
                      <span className="text-slate-900">{participationRate.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${participationRate}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                       <span className="text-[12px]  text-slate-400 uppercase block">Candidate</span>
                       <span className="font-black text-slate-700">{item.candidates?.length || 0} พรรค</span>
                    </div>
                    <div className={`p-2 rounded-full transition-colors ${expandedFaculty === item.faculty_code ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                      {expandedFaculty === item.faculty_code ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Expanded Detail Area --- */}
              {expandedFaculty === item.faculty_code && (
                <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-50 animate-in slide-in-from-top-4 duration-300">
                  {item.candidates && item.candidates.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {item.candidates.map((can) => {
                          const votePercent = item.voted > 0 ? (can.score / item.voted) * 100 : 0;
                          return (
                            <div key={can.candidate_id} className="bg-white p-5 rounded-2xl border border-white shadow-sm flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                                  {can.candidate_number}
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-black text-slate-900">{can.score.toLocaleString()}</p>
                                  <p className="text-[12px]  text-slate-400 uppercase">คะแนนเสียง</p>
                                </div>
                              </div>
                              <div>
                                <h4 className=" text-slate-800 mb-2 text-xl">{can.candidate_name}</h4>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500" style={{ width: `${votePercent}%` }} />
                                </div>
                                <p className=" text-blue-600 mt-1">คิดเป็น {votePercent.toFixed(1)}% ของผู้มาใช้สิทธิ์</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* แถบคะแนนไม่ประสงค์ลงคะแนน */}
                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-dashed border-slate-200 mt-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center"><Users size={16}/></div>
                            <span className="text-sm font-bold text-slate-500">ไม่ประสงค์ลงคะแนน (Abstain)</span>
                         </div>
                         <span className="text-lg font-black text-slate-600">{item.no_vote.toLocaleString()} คะแนน</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                       <Trophy size={32} className="mx-auto text-slate-200 mb-2" />
                       <p className="text-slate-400 font-bold italic">-- คณะนี้ไม่มีพรรคที่สมัครรับการเลือกตั้ง --</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">End of Report</p>
      </div>
    </div>
  );
}