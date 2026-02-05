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

interface OrgReport {
  faculty: string;
  total_eligible: number;
  voted: number;
  no_vote: number;
  candidate_1: number;
  candidate_2: number;
  candidate_3: number;
}

export default function OrganizationCardReport() {
  const [data, setData] = useState<OrgReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // const response = await fetch('/api/v1/admin/reports/organization');
      // const result = await response.json();
      // setData(result);
      const data = await reportService.getReportOrganization();
      setData(data);

    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const totals = data.reduce((acc, curr) => ({
    total_eligible: acc.total_eligible + curr.total_eligible,
    voted: acc.voted + curr.voted,
    no_vote: acc.no_vote + curr.no_vote,
    candidate_1: acc.candidate_1 + curr.candidate_1,
    candidate_2: acc.candidate_2 + curr.candidate_2,
    candidate_3: acc.candidate_3 + curr.candidate_3,
  }), { total_eligible: 0, voted: 0, no_vote: 0, candidate_1: 0, candidate_2: 0, candidate_3: 0 });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-700">
      
      {/* --- Sticky Header Actions --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">องค์การนิสิต</h1>
          <p className="text-slate-500 font-medium">รายงานคะแนนรายคณะ รูปแบบ Card View</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
            <Printer size={20} className="text-slate-600" />
          </button>
          <button onClick={fetchReport} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
            <RefreshCcw size={20} className="text-slate-600" />
          </button>
          <button onClick={() => {/* Excel Logic */}} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 active:scale-95 transition-all">
            <FileSpreadsheet size={18} /> <span className="hidden md:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* --- Overall University Score Card --- */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
        <div className="flex items-center gap-3 mb-6 opacity-80">
          <Trophy size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Grand Summary (All Faculties)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
           <ScoreBlock label="เบอร์ 1" value={totals.candidate_1} color="bg-blue-400" />
           <ScoreBlock label="เบอร์ 2" value={totals.candidate_2} color="bg-indigo-400" />
           <ScoreBlock label="เบอร์ 3" value={totals.candidate_3} color="bg-purple-400" />
        </div>
        <div className="pt-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-sm font-medium">
           <div className="flex items-center gap-2">
             <Users size={16} className="text-blue-300" /> ผู้มีสิทธิ์: {totals.total_eligible.toLocaleString()} คน
           </div>
           <div className="flex items-center gap-2">
             <Vote size={16} className="text-emerald-400" /> มาใช้สิทธิ์: {totals.voted.toLocaleString()} ({((totals.voted/totals.total_eligible)*100).toFixed(1)}%)
           </div>
           <div className="text-blue-200">ไม่ประสงค์ลงคะแนน: {totals.no_vote.toLocaleString()}</div>
        </div>
      </div>

      {/* --- Faculty Cards List --- */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : data.map((item, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
              <h3 className="text-xl font-black text-slate-900">{item.faculty}</h3>
              <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full text-xs font-bold text-slate-500">
                <Users size={14} /> สิทธิ์: {item.total_eligible} | มาใช้สิทธิ์: {item.voted} ({((item.voted/item.total_eligible)*100).toFixed(1)}%)
              </div>
            </div>

            {/* Candidate Progress Grid */}
            <div className="space-y-4">
              <CandidateProgress label="เบers 1" score={item.candidate_1} total={item.voted} color="bg-blue-500" />
              <CandidateProgress label="เบers 2" score={item.candidate_2} total={item.voted} color="bg-indigo-500" />
              <CandidateProgress label="เบers 3" score={item.candidate_3} total={item.voted} color="bg-purple-500" />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 text-right">
              <span className="text-[10px] font-black text-slate-300 uppercase">ไม่ประสงค์ลงคะแนน: {item.no_vote} คะแนน</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Sub-Components ---

function ScoreBlock({ label, value, color }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-4xl font-black tracking-tight">{value.toLocaleString()}</p>
    </div>
  );
}

function CandidateProgress({ label, score, total, color }: any) {
  const percent = total > 0 ? (score / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-slate-700">{label}</span>
        <span className="text-sm font-black text-slate-900">
          {score.toLocaleString()} <span className="text-[10px] text-slate-400 ml-1 font-bold">{percent.toFixed(1)}%</span>
        </span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}