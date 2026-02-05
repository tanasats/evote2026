'use client'
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
    Loader2, ChevronDown, ChevronUp, Users, Vote,
    FileSpreadsheet, Printer, RefreshCcw, ShieldCheck, AlertCircle
} from 'lucide-react';
import { reportService } from '@/services/reportService';

export default function CouncilReport() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);

    // 1. Fetch Data from API
    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await reportService.getReportCouncil();
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

    // ฟังก์ชัน Export Excel (Flattened)
    const exportToExcel = () => {
        const exportData: any[] = [];
        data.forEach(item => {
            if (item.candidates) {
                item.candidates.forEach((can: any) => {
                    exportData.push({
                        'คณะ': item.faculty,
                        'ประเภท': 'ผู้สมัครสภานิสิต',
                        'เบอร์': can.candidate_number,
                        'ชื่อ-นามสกุล': can.candidate_name,
                        'คะแนนที่ได้': can.score,
                        'จำนวนนิสิตมาใช้สิทธิ์ของคณะ': item.voted
                    });
                });
            }
            exportData.push({ 'คณะ': item.faculty, 'ประเภท': 'ไม่ประสงค์ลงคะแนน', 'คะแนนที่ได้': item.no_vote });
            exportData.push({}); // เว้นบรรทัด
        });
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "คะแนนสภานิสิต");
        XLSX.writeFile(workbook, `Council_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) return <div className="flex flex-col h-96 items-center justify-center space-y-4"><Loader2 className="animate-spin text-blue-600" size={40} /><p className="text-slate-500 font-bold">กำลังประมวลผลคะแนนสภานิสิต...</p></div>;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">ผลการเลือกตั้ง สภานิสิต</h1>
                    <p className="text-slate-500 font-medium italic">สรุปคะแนนผู้สมัคร (เลือกได้ไม่เกิน 2 เบอร์) จำแนกตามคณะ</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-emerald-900/10 active:scale-95 transition-all">
                        <FileSpreadsheet size={18} /> Export Excel
                    </button>
                    <button onClick={fetchReport} className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
                        <RefreshCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Faculty Cards ----------------------------------*/}
            <div className="grid gap-4">
                {data.map((item) => {
                    const participationRate = item.total_eligible > 0 ? (item.voted / item.total_eligible) * 100 : 0;
                    return (
                        <div key={item.faculty_code} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                            {/* Header Card (Summary) */}
                            <div
                                onClick={() => setExpandedFaculty(expandedFaculty === item.faculty_code ? null : item.faculty_code)}
                                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    {/* <div className="w-14 h-14 rounded-2xl bg-ballot-blue text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <ShieldCheck size={28} />
                                </div> */}
                                    <div className="bg-ballot-blue w-14 h-14 rounded-2xl  text-white flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold leading-none mb-1">CODE</span>
                                        <span className="text-lg font-black leading-none">{item.faculty_code}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{item.faculty}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Users size={14} /> ผู้มีสิทธิ์: {item.total_eligible}</span>
                                            <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-indigo-50 px-2 py-0.5 rounded-md"><Vote size={14} /> มาใช้สิทธิ์: {item.voted} ({((item.voted / item.total_eligible) * 100).toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="flex items-center gap-6 self-end lg:self-center">
                                {item.candidates && item.candidates.length > 0 && (
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Candidates</span>
                                        <span className="text-sm font-black text-slate-700"><span className='text-2xl'>{item.candidates?.length || 0}</span> คน</span>
                                    </div>
                                )}
                                <div className={`p-2 rounded-full transition-all ${expandedFaculty === item.faculty_code ? 'bg-ballot-blue text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    {expandedFaculty === item.faculty_code ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div> */}


                                <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-50">
                                    <div className="hidden sm:block w-32">
                                        <div className="flex justify-between text-[12px] font-black mb-1.5">
                                            <span className="text-slate-400">PERCENTAGE</span>
                                            <span className="text-slate-900">{participationRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${participationRate}%` }} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-[12px] font-black text-slate-400 uppercase block">Candidates</span>
                                            <span className="text-sm font-black text-slate-700">{item.candidates?.length || 0} คน</span>
                                        </div>
                                        <div className={`p-2.5 rounded-full transition-all duration-300 ${expandedFaculty === item.faculty_code ? 'bg-slate-900 text-white rotate-0' : 'bg-slate-50 text-slate-400'}`}>
                                            {expandedFaculty === item.faculty_code ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
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
                                                //const voteRate = item.voted > 0 ? ((can.score / item.voted) * 100).toFixed(1) : 0;
                                                const popularityRate = item.voted > 0 ? ((can.score / item.total_score) * 100) : 0;
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
                                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${popularityRate.toFixed(1)}%` }} />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-indigo-500 mt-2 italic">ความนิยม {popularityRate.toFixed(1)} % ของผู้ใช้สิทธิ์</p>
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
                    )
                }
                )}
            </div>








        </div>
    );
}